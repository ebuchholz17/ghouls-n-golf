
/**
 * Created by erik.buchholz on 3/8/2017.
 */
import {GameSettings} from "../settings/GameSettings";
import {Input} from "../Game";
import {State} from "./State";
import {StateManager} from "./StateManager";
import {StateNames} from "../const/Enums";

export class WinScreenState extends State {
    
    private _background: PIXI.Sprite;
    private _container: PIXI.Container;
    private _titleTextfield: PIXI.extras.BitmapText;

    /**
     * Calls the base State constructor
     * @param {StateManager} controller  A reference to the state controller
     * @param {PIXI.Container} stage     A reference the stage, the main PIXI container
     */
    public constructor (controller: StateManager, stage: PIXI.Container) {
        super(controller, stage);
    }
    
    public init (): void {
        this._container = new PIXI.Container;
        // QQQ
        this._container.scale.set(3/5, 3/5);
        this._stage.addChild(this._container);

        let text = "You win!";
        if (GameSettings.numPlayers == 2) {
            text = "Player " + GameSettings.winningPlayer + " wins!";
        }
        this._titleTextfield = new PIXI.extras.BitmapText(text, {
            font: "64px font"
        });
        (<PIXI.Point>this._titleTextfield.anchor).set(0.5, 0.5);
        this._container.addChild(this._titleTextfield);
        this._titleTextfield.x = 640;
        this._titleTextfield.y = 200;

    }
    
    public update (inputs: Input[], dt: number, renderer: any): void {
        if (inputs[0].startJustPressed || inputs[1].startJustPressed || 
            inputs[0].jumpJustPressed || inputs[1].jumpJustPressed) {
            this._manager.startState(StateNames.TITLE_SCREEN);
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
        this._titleTextfield.destroy();
        this._container.destroy();
    }
}
