import { Server, routePartykitRequest, type Connection } from "partyserver";
import { ClientMessage, RoomState, ServerMessage } from "../lib/types";
import { DEFAULT_SCORING_SETTINGS } from "../lib/scoringSettings";
import { createInitialRoomState } from "./roomStore";
import {
  addPlayer,
  applyAction,
  kickPlayer,
  markConnected,
  markDisconnected,
} from "./gameLogic";

interface Env {
  YatzyRoom: DurableObjectNamespace<YatzyRoom>;
}

type ConnState = { playerId?: string };

export class YatzyRoom extends Server<Env> {
  state: RoomState;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.state = createInitialRoomState(
      this.name ?? "",
      "virtual",
      DEFAULT_SCORING_SETTINGS
    );
  }

  broadcastState() {
    const msg: ServerMessage = { type: "ROOM_STATE_UPDATE", state: this.state };
    this.broadcast(JSON.stringify(msg));
  }

  sendError(connection: Connection, message: string) {
    const msg: ServerMessage = { type: "ERROR", message };
    connection.send(JSON.stringify(msg));
  }

  onConnect(connection: Connection) {
    // Wait for JOIN_ROOM to associate a playerId with this connection.
    connection.send(
      JSON.stringify({ type: "ROOM_STATE_UPDATE", state: this.state } satisfies ServerMessage)
    );
  }

  onClose(connection: Connection) {
    const cs = connection.state as ConnState | null;
    if (cs?.playerId) {
      this.state = markDisconnected(this.state, cs.playerId);
      const msg: ServerMessage = {
        type: "PLAYER_DISCONNECTED",
        playerId: cs.playerId,
      };
      this.broadcast(JSON.stringify(msg));
      this.broadcastState();
    }
  }

  onMessage(sender: Connection, message: string | ArrayBuffer | ArrayBufferView) {
    if (typeof message !== "string") return;
    let parsed: ClientMessage;
    try {
      parsed = JSON.parse(message);
    } catch {
      return;
    }

    if (parsed.type === "JOIN_ROOM") {
      sender.setState({ playerId: parsed.playerId } satisfies ConnState);
      const wasKnown = this.state.players.some((p) => p.id === parsed.playerId);
      const isFirstPlayer = this.state.players.length === 0;
      const { state, error } = addPlayer(this.state, parsed.playerId, parsed.name);
      if (error) {
        this.sendError(sender, error);
        return;
      }
      this.state = state;
      if (isFirstPlayer) {
        if (parsed.throwMode) this.state = { ...this.state, throwMode: parsed.throwMode };
        if (parsed.settings) this.state = { ...this.state, settings: parsed.settings };
      }
      if (wasKnown) {
        this.state = markConnected(this.state, parsed.playerId);
        const msg: ServerMessage = {
          type: "PLAYER_RECONNECTED",
          playerId: parsed.playerId,
        };
        this.broadcast(JSON.stringify(msg));
      }
      this.broadcastState();
      return;
    }

    if (parsed.type === "LEAVE_ROOM") {
      const cs = sender.state as ConnState | null;
      if (cs?.playerId) {
        this.state = markDisconnected(this.state, cs.playerId);
        this.broadcastState();
      }
      return;
    }

    const cs = sender.state as ConnState | null;
    if (!cs?.playerId) {
      this.sendError(sender, "Dołącz do pokoju przed wykonaniem akcji.");
      return;
    }
    const player = this.state.players.find((p) => p.id === cs.playerId);
    if (!player) {
      this.sendError(sender, "Nie znaleziono gracza w pokoju.");
      return;
    }

    if (parsed.type === "KICK_PLAYER") {
      const { state, error } = kickPlayer(
        this.state,
        { playerId: cs.playerId, isHost: player.isHost },
        parsed.playerId
      );
      if (error) {
        this.sendError(sender, error);
        return;
      }
      this.state = state;
      for (const conn of this.getConnections<ConnState>()) {
        if (conn.state?.playerId === parsed.playerId) {
          conn.send(JSON.stringify({ type: "KICKED" } satisfies ServerMessage));
          conn.close();
        }
      }
      this.broadcastState();
      return;
    }

    const { state, error } = applyAction(this.state, parsed, {
      playerId: cs.playerId,
      isHost: player.isHost,
    });

    if (error) {
      this.sendError(sender, error);
      return;
    }

    this.state = state;
    this.broadcastState();
  }
}

const worker = {
  async fetch(request: Request, env: Env) {
    return (
      (await routePartykitRequest(request, env)) ??
      new Response("Not found", { status: 404 })
    );
  },
};

export default worker;
