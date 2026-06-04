import type { Server as HTTPServer } from 'node:http';
import { Server as SocketIOServer } from 'socket.io';

interface Player {
  id: string;
  name?: string;
  roomId?: string;
}

interface Room {
  id: string;
  players: Map<string, Player>;
  createdAt: Date;
}

// In-memory state — no game logic yet (phase 2)
const rooms = new Map<string, Room>();
const players = new Map<string, Player>();

export function attachSocketIO(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    path: '/ws',
    cors: {
      origin: process.env.WEB_ORIGIN ?? 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`[ws] connected    id=${socket.id}`);
    players.set(socket.id, { id: socket.id });

    socket.on('disconnect', (reason) => {
      console.log(`[ws] disconnected id=${socket.id} reason=${reason}`);
      const player = players.get(socket.id);
      if (player?.roomId) {
        const room = rooms.get(player.roomId);
        if (room) {
          room.players.delete(socket.id);
          if (room.players.size === 0) {
            rooms.delete(player.roomId);
            console.log(`[ws] room empty, removed roomId=${player.roomId}`);
          }
        }
      }
      players.delete(socket.id);
    });
  });

  return io;
}
