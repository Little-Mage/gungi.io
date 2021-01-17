import React, { useState } from 'react';
import { Footer } from '../components/ui/Footer';
import GlobalStyle from '../components/ui/GlobalStyle';
import { Header } from '../components/ui/Header';
import GameButton from '../components/ui/GameButton';
import WrapperSpaceBetween from '../components/ui/WrapperSpaceBetween';
import { TurnIndictor } from '../components/ui/TurnIndictor';
import { RouteComponentProps } from 'react-router-dom';
import { StockpilePanel } from '../components/ui/StockpilePanel';
import { TowerDetails } from '../components/ui/TowerDetails';

// TODO: remove dependency, the below is for ui testing purposes only (instead store game on server and fetch state by api call after each turn)
import * as Gungi from 'gungi.js';
import boardIcon from '../assets/gungiboard.svg';
import { Board } from '../components/gameboard/Board';
const gungi: any = new Gungi();

interface GameProps extends RouteComponentProps {}

export const Game: React.FC<GameProps> = ({ history }) => {
	document.title = 'Game | Gungi.io';

	const [moveTypeSelected, setMoveTypeSelected] = useState(() => {
		return 'PLACE';
	});

	return (
		<>
			<GlobalStyle />
			<Header home={false} />

			<div style={{ minHeight: '100%', margin: '1.1rem 0' }}>
				<div
					style={{
						display: 'flex',
						flexDirection: 'row',
						alignItems: 'center',
						justifyContent: 'space-between',
						height: '100%',
						marginLeft: '8em',
						userSelect: 'none',
					}}
				>
					<div
						style={{
							width: '92.5%',
							height: '0',
							backgroundImage: `url(${boardIcon})`,
							backgroundRepeat: 'no-repeat',
							backgroundSize: '100%',
							display: 'block',
							paddingBottom: '96.2vh',
							position: 'relative',
							userSelect: 'none',
						}}
					>
						<Board />
					</div>

					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: '',
							margin: '0 3em',
							width: '80%',
							flexWrap: 'wrap',
						}}
					>
						<WrapperSpaceBetween>
							<GameButton
								backgroundColor="#29DA37"
								backgroundColorHover="#0CB51A"
								selected={moveTypeSelected === 'PLACE'}
								onClick={() => {
									setMoveTypeSelected('PLACE');
								}}
							>
								PLACE
							</GameButton>

							{gungi.phase() === 'game' ? (
								<>
									<GameButton
										backgroundColor="#3C85F5"
										backgroundColorHover="#2169D8"
										selected={moveTypeSelected === 'MOVE'}
										onClick={() => {
											setMoveTypeSelected('MOVE');
										}}
									>
										MOVE
									</GameButton>

									<GameButton
										backgroundColor="#F53C5E"
										backgroundColorHover="#E1294A"
										selected={moveTypeSelected === 'ATTACK'}
										onClick={() => {
											setMoveTypeSelected('ATTACK');
										}}
									>
										ATTACK
									</GameButton>

									<GameButton
										backgroundColor="#F5AB3C"
										backgroundColorHover="#DF921F"
										selected={moveTypeSelected === 'STACK'}
										onClick={() => {
											setMoveTypeSelected('STACK');
										}}
									>
										STACK
									</GameButton>
								</>
							) : (
								<GameButton
									backgroundColor="#16CD8B"
									backgroundColorHover="#00B172"
								>
									READY
								</GameButton>
							)}
						</WrapperSpaceBetween>

						<WrapperSpaceBetween>
							<div
								style={{
									fontSize: '2rem',
									fontWeight: 'bolder',
								}}
							>
								{gungi.phase() === 'game' ? 'Game Phase' : 'Draft Phase'}
							</div>

							<div>
								<GameButton
									backgroundColor="#9044D6"
									backgroundColorHover="#7E42DF"
									onClick={() => {
										history.push('/lobby');
									}}
								>
									LOBBY
								</GameButton>

								<GameButton
									backgroundColor="#CD16BB"
									backgroundColorHover="#B0039F"
								>
									FORFEIT
								</GameButton>
							</div>
						</WrapperSpaceBetween>

						<WrapperSpaceBetween>
							<TurnIndictor
								player="b"
								isTurn={'b' === gungi.turn()}
								playerName="player 1"
							/>
							<TurnIndictor
								player="w"
								isTurn={'w' === gungi.turn()}
								playerName="player 2"
							/>
						</WrapperSpaceBetween>

						<TowerDetails />
						<br />
						<StockpilePanel
							player="b"
							playerName="player 1"
							playerStockPile={gungi.stockpile(gungi.BLACK)}
						/>

						<br />
						<StockpilePanel
							player="w"
							playerName="player 2"
							playerStockPile={gungi.stockpile(gungi.WHITE)}
						/>
					</div>
				</div>
			</div>

			<Footer />
		</>
	);
};
