/**
 * Created by erik.buchholz on 3/8/2017.
 */
import {ActionGame} from "../action/ActionGame";
import {StateNames} from "../const/Enums";
import {Events} from "../const/Events";
import {GameSettings} from "../settings/GameSettings";
import {Golf} from "../golf/Golf";
import {Golfer} from "../golf/Golf";
import {Input} from "../Game";
import {PlayerCharacter} from "../action/ActionGame";
import {PlayerUI} from "../ui/PlayerUI";
import {State} from "./State";
import {StateManager} from "./StateManager";
import {LevelType} from "../action/ActionGame";

export class Player {
    // TODO(ebuchholz): add input here?
    public inActionGame: boolean = false;
    public golfer: Golfer;
    public character: PlayerCharacter;
    public enteringLevel: boolean = false;
    public exitingLevel: boolean = false;
};

export class GameState extends State {
    
    private _mainContainer: PIXI.Container;
    private _subContainer: PIXI.Container;
    private _golf: Golf;
    private _actionGame: ActionGame;
    private _playerUI: PlayerUI;

    private _players: Player[];

    private _screen1Texture: PIXI.RenderTexture;
    private _screen2Texture: PIXI.RenderTexture;
    private _screen1: PIXI.Sprite;
    private _screen2: PIXI.Sprite;
    private _screenWidth: number;
    private _screenHeight: number;
    private _gameWidth: number;
    private _gameHeight: number;

    private _renderer: any;
    
    /**
     * Calls the base State constructor
     * @param {StateManager} controller  A reference to the state controller
     * @param {PIXI.Container} stage     A reference the stage, the main PIXI container
     */
    public constructor (controller: StateManager, stage: PIXI.Container) {
        super(controller, stage);

    }
    
    public init (renderer: any): void {
        this._mainContainer = new PIXI.Container();
        this._stage.addChild(this._mainContainer);
        this._renderer = renderer;

        this._subContainer = new PIXI.Container();
        this._subContainer.scale.set(3, 3);

        this._golf = new Golf(renderer);
        this._actionGame = new ActionGame();
        this._playerUI = new PlayerUI();
        this._playerUI.setWind(this._golf);

        this._players = [];
        for (let i = 0; i < GameSettings.numPlayers; ++i) {
            let player = new Player();
            this._golf.assignPlayer(player, i);
            this._actionGame.assignPlayer(player, i);
            this._players.push(player);
        }
        if (GameSettings.numPlayers == 1) {
            //this._screenWidth = 1280;
            //this._screenHeight = 720;
            this._screenWidth = 768;
            this._screenHeight = 432;
            this._gameWidth = 256;
            this._gameHeight = 144;
        }
        else if (GameSettings.numPlayers == 2) {
            this._screenWidth = 384;
            this._screenHeight = 432;
            this._gameWidth = 128;
            this._gameHeight = 144;
        }
        // Determine whether to force game to be aligned to pixels- less smooth, but more accurate to pixel style
        this._screen1Texture = PIXI.RenderTexture.create(this._screenWidth, this._screenHeight);
        //this._screen1Texture = PIXI.RenderTexture.create(this._gameWidth, this._gameHeight);
        this._screen1Texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
        this._screen1 = new PIXI.Sprite(this._screen1Texture);
        this._mainContainer.addChild(this._screen1);
        this._screen1.x = 0;
        this._screen1.y = 0;
        //this._screen1.scale.set(3, 3);

        if (GameSettings.numPlayers == 2) {
            this._screen2Texture = PIXI.RenderTexture.create(this._screenWidth, this._screenHeight);
            //this._screen2Texture = PIXI.RenderTexture.create(this._gameWidth, this._gameHeight);
            this._screen2Texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
            this._screen2 = new PIXI.Sprite(this._screen2Texture);
            this._mainContainer.addChild(this._screen2);
            this._screen2.x = this._screenWidth;
            this._screen2.y = 0;
            //this._screen2.scale.set(3, 3);
        }

        // Temporary action levels
        if (true) {
            window.addEventListener("keydown", function (e: any) {
                if (e.code == "KeyR") {
                    if(this._players[0].inActionGame) {
                        this._players[0].character.moveProps.position.x = 1300;
                        this._players[0].character.moveProps.position.y = 50;
                        //this._actionGame.removePlayerFromLevel(this._players[0]);
                        //this._golf.exitGolfBall(this._players[0].golfer);
                    }
                    if(this._players[1] && this._players[1].inActionGame) {
                        this._players[1].character.moveProps.position.x = 1300;
                        this._players[1].character.moveProps.position.y = 50;
                        //this._actionGame.removePlayerFromLevel(this._players[0]);
                        //this._golf.exitGolfBall(this._players[0].golfer);
                    }
                }
            }.bind(this));
        }
    }
    
    public update (inputs: Input[], dt: number, renderer: any): void {
        this._golf.update(inputs, dt);
        this._actionGame.update(inputs, dt);
        for (let i = 0; i < this._players.length; ++i) {
            let player = this._players[i];
            if (player.enteringLevel) {
                player.enteringLevel = false;
                let level;
                if (player.golfer.levelTerrainType == LevelType.GREEN) {
                    level = this._actionGame.greenLevel;
                }
                else {
                    level = this._actionGame.generateLevel(player.golfer.levelTerrainType);
                }
                this._actionGame.addPlayerToLevel(player, level);

            }
            else if (player.character.timeToLeaveTheLevel) {
                player.character.timeToLeaveTheLevel = false;
                this._actionGame.removePlayerFromLevel(player);
                this._golf.exitGolfBall(player.golfer, player.character.wonLevel);
            }
            if (!player.inActionGame) {
                this._subContainer.addChild(this._golf.container);
                this._subContainer.addChild(this._playerUI.container);
                this._playerUI.resize(this._gameWidth, this._gameHeight);

                this._golf.setCamera(i, this._gameWidth / 2, this._gameHeight / 2);
                this._playerUI.update(player);
                this._playerUI.updateFlag(this._actionGame.greenLevel.flag);
                renderer.render(this._subContainer, this["_screen" + (i+1) + "Texture"]);
                this._subContainer.removeChild(this._golf.container);
            }
            else {
                this._subContainer.addChild(this._actionGame.container);
                this._subContainer.addChild(this._playerUI.container);
                this._playerUI.resize(this._gameWidth, this._gameHeight);

                this._actionGame.setCamera(player, this._gameWidth / 2, this._gameHeight / 2);
                this._playerUI.update(player);
                this._playerUI.updateFlag(this._actionGame.greenLevel.flag);
                renderer.render(this._subContainer, this["_screen" + (i+1) + "Texture"]);
                this._subContainer.removeChild(this._actionGame.container);
            }
        }
        if (this._actionGame.gameOver) {
            this._manager.startState(StateNames.WIN_SCREEN);
        }
    }
    
    /**
     * Resizes the game
     */
    public resize (): void {

    }
    
    /**
     * Destroys the state
     */
    public destroy (): void {
        this._mainContainer.destroy();
        this._subContainer.destroy();
        this._screen1.destroy();
        this._screen1Texture.destroy();
        if (this._screen2) {
            this._screen2.destroy();
            this._screen2Texture.destroy();
        }
    }
}
