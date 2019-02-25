/**
 * Created by erik.buchholz on 3/8/2017.
 */
import {GameSettings} from "../settings/GameSettings";
import {Input} from "../Game";
import {State} from "./State";
import {StateManager} from "./StateManager";
import {StateNames} from "../const/Enums";

export class TitleScreenState extends State {
    
    private _background: PIXI.Sprite;
    private _container: PIXI.Container;
    private _menuArrow: PIXI.Sprite;
    private _titleTextfield: PIXI.extras.BitmapText;

    private _menuIndex: number = 0;
    
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

        this._titleTextfield = new PIXI.extras.BitmapText("Ghouls 'n Golf", {
            font: "64px font"
        });
        (<PIXI.Point>this._titleTextfield.anchor).set(0.5, 0.5);
        this._container.addChild(this._titleTextfield);
        this._titleTextfield.x = 640;
        this._titleTextfield.y = 200;

        let onePlayerText = new PIXI.extras.BitmapText("1 Player", {
            font: "48px font"
        });
        (<PIXI.Point>onePlayerText.anchor).set(0.5, 0.5);
        this._container.addChild(onePlayerText);
        onePlayerText.x = 640;
        onePlayerText.y = 400;

        let twoPlayerText = new PIXI.extras.BitmapText("2 Players", {
            font: "48px font"
        });
        (<PIXI.Point>twoPlayerText.anchor).set(0.5, 0.5);
        this._container.addChild(twoPlayerText);
        twoPlayerText.x = 640;
        twoPlayerText.y = 460;

        this._menuArrow = new PIXI.Sprite(GameSettings.textures["menu_arrow"]);
        this._menuArrow.anchor.set(0.5, 0.5);
        this._container.addChild(this._menuArrow);
        this._menuArrow.x = 480;
        this._menuArrow.y = 400;
        this._menuArrow.scale.set(0.5, 0.5);
    }

    private onStartButtonClicked (): void {
        this._manager.startState(StateNames.GAME);
    }
    
    public update (inputs: Input[], dt: number, renderer: any): void {
        if (inputs[0].downJustPressed || inputs[1].downJustPressed) {
            this._menuIndex++;
        }
        if (inputs[0].upJustPressed || inputs[1].upJustPressed) {
            this._menuIndex--;
        }
        if (this._menuIndex > 1) { this._menuIndex = 1; }
        if (this._menuIndex < 0) { this._menuIndex = 0; }
        this._menuArrow.y = 400 + this._menuIndex * 60
        if (inputs[0].startJustPressed || inputs[1].startJustPressed || 
            inputs[0].jumpJustPressed || inputs[1].jumpJustPressed) {
            if (this._menuIndex == 0) {
                GameSettings.numPlayers = 1;
            }
            if (this._menuIndex == 1) {
                GameSettings.numPlayers = 2;
            }
            this._manager.startState(StateNames.GAME);
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
