import express from 'express';
import { v4 } from 'uuid';
import { InMemorySessionStore, Move, User } from './sessionStore';

const PORT = process.env.HTTP_PORT || 4001;
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
	cors: { origin: 'http://localhost:3000', methods: ['GET', 'POST'] },
	upgradeTimeout: 30000,
	pingInterval: 10000,
	pingTimeout: 60000,
});

const { Gungi } = require('gungi.js');
const gungi = new Gungi();
console.log(gungi.ascii());

const main = async () => {
	const sessionStore = new InMemorySessionStore();

	io.use((socket: any, next: any) => {
		const username = socket.handshake.auth.username;
		const gameId = socket.handshake.auth.gameId;
		socket.username = username;
		socket.gameId = gameId;
		next();
	});

	io.on('connection', (socket: any) => {
		let users: User[] = [];
		let roomId = '';

		if (!socket.gameId) {
			roomId = v4();

			sessionStore.saveSession(roomId, {
				roomId,
				game: new Gungi(),
				users: [],
			});
			sessionStore.addUser(roomId, {
				userId: socket.id,
				username: socket.username,
				userType: 'creator',
			});
		} else {
			roomId = socket.gameId;

			sessionStore.addUser(roomId, {
				userId: socket.id,
				username: socket.username,
				userType: 'spectator',
			});
		}

		users = sessionStore.getUsers(roomId);
		socket.join(roomId);

		console.log('roomId', roomId);
		console.log('users', users);

		io.to(roomId).emit('roomId', roomId);
		io.to(roomId).emit('users', users);

		socket.on(
			'init_game',
			({ opponentId, roomId }: { opponentId: string; roomId: string }) => {
				console.log('opponent: ', opponentId);
				console.log('room: ', roomId);

				// emit game to all clients in room
				sessionStore.editUserType(roomId, opponentId, 'opponent');
				const updatedUsers = sessionStore.getUsers(roomId);
				console.log('updated users: ', updatedUsers);
				io.to(roomId).emit('game', {
					gameState: sessionStore.getGameState(roomId),
					players: updatedUsers,
				});
			}
		);

		socket.on(
			'make_move',
			({ roomId, move }: { roomId: string; move: Move }) => {
				console.log('room: ', roomId);
				console.log('move: ', JSON.stringify(move, null, 2));

				sessionStore.makeGameMove(roomId, move);

				// emit updated game to all clients in room
				io.to(roomId).emit('game', {
					gameState: sessionStore.getGameState(roomId),
					players: sessionStore.getUsers(roomId),
				});
			}
		);
	});

	http.listen(PORT, () => {
		console.log(`🚀 server started at http://localhost:${PORT}.`);
	});
};

main();
