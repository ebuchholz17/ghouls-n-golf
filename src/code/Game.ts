import {BootManager} from "./settings/BootManager";
import {GameSettings} from "./settings/GameSettings";
import {StateNames} from "./const/Enums";

import {StateManager} from "./state/StateManager";
import {AssetLoaderState} from "./state/AssetLoaderState";
import {TitleScreenState} from "./state/TitleScreenState";
import {GameState} from "./state/GameState";
import {WinScreenState} from "./state/WinScreenState";

// TODO(ebuchholz): maybe put this somewhere better
export class Input {
    public useKeyboard: boolean = false;
    public upIsDown: boolean = false;
    public downIsDown: boolean = false;
    public leftIsDown: boolean = false;
    public rightIsDown: boolean = false;
    public startIsDown: boolean = false;
    public jumpIsDown: boolean = false;
    public attackIsDown: boolean = false;

    public upJustPressed: boolean = false;
    public downJustPressed: boolean = false;
    public leftJustPressed: boolean = false;
    public rightJustPressed: boolean = false;
    public startJustPressed: boolean = false;
    public jumpJustPressed: boolean = false;
    public attackJustPressed: boolean = false;
};

export class Game {

    private _inputs: Input[];

    private _parentContainer: any;
    private _renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer;
    private _resizeCallback: (this: this, ev: Event) => any;
    private _stage: PIXI.Container;
    private _lastWidth: number = 0;
    private _lastHeight: number = 0;
    private _stateManager: StateManager;
    private _targetFrameRate: number = 60;
    private _elapsedTime: number = 0;

    public start (elementID: string) {
        let viewport = document.getElementById(elementID);
        this._parentContainer = viewport;

        // TODO(ebuchholz): determine how to make this look as nice as possible at high res
        PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
        let pixelRatio = window.devicePixelRatio || 1;
        let rendererOptions = {
            autoResize: true,
            backgroundColor: 0x01d124f,
            resolution: pixelRatio,
            roundPixels: true,
            antialias: false
        };
        this._renderer = PIXI.autoDetectRenderer(10, 10, rendererOptions);
        this._stage = new PIXI.Container();
        viewport.insertAdjacentElement("afterbegin", this._renderer.view);
        this._renderer.view.draggable = false;
        // prevent user from selecting the canvas, need browser prefixes for now
        this._renderer.view.style['-webkit-user-select'] = 'none';
        this._renderer.view.style['-khtml-user-select'] = 'none';
        this._renderer.view.style['-moz-user-select'] = 'none';
        this._renderer.view.style['-ms-user-select'] = 'none';
        this._renderer.view.style['user-select'] = 'none';
        this._renderer.view.style['outline'] = 'none';
        this._renderer.view.style['-webkit-tap-highlight-color'] = 'rgba(255, 255, 255, 0)';

        let bootManager = new BootManager();
        bootManager.init();

        // TODO(ebuchholz): do something smart where the first input to press a button becomes player 1, etc.
        this._inputs = [];
        for (let i = 0; i < 4; ++i) {
            this._inputs[i] = new Input();
        }

        this._stateManager = new StateManager(this._stage, this._renderer);
        this._stateManager.registerState(
            StateNames.ASSET_LOADER,
            new AssetLoaderState(this._stateManager, this._stage)
        );
        this._stateManager.registerState(
            StateNames.TITLE_SCREEN,
            new TitleScreenState(this._stateManager, this._stage)
        );
        this._stateManager.registerState(
            StateNames.GAME,
            new GameState(this._stateManager, this._stage)
        );
        this._stateManager.registerState(
            StateNames.WIN_SCREEN,
            new WinScreenState(this._stateManager, this._stage)
        );

        this._resizeCallback = this.resize.bind(this);
        window.addEventListener("orientationchange", this._resizeCallback, false);
        window.addEventListener("resize", this._resizeCallback, false);

        PIXI.ticker.shared.add(this.update, this);
        this._stateManager.startState(StateNames.ASSET_LOADER);

        // Keybaord support player 1 only?
        window.addEventListener("keydown", this.onKeyDown.bind(this));
        window.addEventListener("keyup", this.onKeyUp.bind(this));
    }

    private resize () {
        let newWidth = this._parentContainer.clientWidth;
        let newHeight = this._parentContainer.clientHeight;
        let aspectRatio = GameSettings.nativeWidth / GameSettings.nativeHeight;
        if (newWidth / newHeight < aspectRatio) {
            newHeight = GameSettings.nativeHeight * (newWidth / GameSettings.nativeWidth);
        }
        else {
            newWidth = GameSettings.nativeWidth * (newHeight / GameSettings.nativeHeight);
        }
        if ((newWidth && GameSettings.width != newWidth) || 
            (newHeight && GameSettings.height != newHeight)) {
            GameSettings.width = newWidth;
            GameSettings.height = newHeight;

            this._renderer.resize(GameSettings.width, GameSettings.height);
            let scale = GameSettings.width / GameSettings.nativeWidth;
            this._stage.scale.set(scale, scale);
            this._stateManager.resize();
        }
    }

    private onKeyDown (e: any) {
        switch (e.code) {
        case "ArrowRight":
            if (this._inputs[0].rightIsDown == false) {
                this._inputs[0].rightJustPressed = true;
            }
            this._inputs[0].rightIsDown = true;
            this._inputs[0].useKeyboard = true;
            break;
        case "ArrowLeft":
            if (this._inputs[0].leftIsDown == false) {
                this._inputs[0].leftJustPressed = true;
            }
            this._inputs[0].leftIsDown = true;
            this._inputs[0].useKeyboard = true;
            break;
        case "ArrowUp":
            if (this._inputs[0].upIsDown == false) {
                this._inputs[0].upJustPressed = true;
            }
            this._inputs[0].upIsDown = true;
            this._inputs[0].useKeyboard = true;
            break;
        case "ArrowDown":
            if (this._inputs[0].downIsDown == false) {
                this._inputs[0].downJustPressed = true;
            }
            this._inputs[0].downIsDown = true;
            this._inputs[0].useKeyboard = true;
            break;
        case "Enter":
            if (this._inputs[0].startIsDown == false) {
                this._inputs[0].startJustPressed = true;
            }
            this._inputs[0].startIsDown = true;
            this._inputs[0].useKeyboard = true;
            break;
        case "KeyZ":
            if (this._inputs[0].jumpIsDown == false) {
                this._inputs[0].jumpJustPressed = true;
            }
            this._inputs[0].jumpIsDown = true;
            this._inputs[0].useKeyboard = true;
            break;
        case "KeyX":
            if (this._inputs[0].attackIsDown == false) {
                this._inputs[0].attackJustPressed = true;
            }
            this._inputs[0].attackIsDown = true;
            this._inputs[0].useKeyboard = true;
            break;
        }
    }
    
    private onKeyUp (e: any) {
        switch (e.code) {
        case "ArrowRight":
            this._inputs[0].rightIsDown = false;
            break;
        case "ArrowLeft":
            this._inputs[0].leftIsDown = false;
            break;
        case "ArrowUp":
            this._inputs[0].upIsDown = false;
            break;
        case "ArrowDown":
            this._inputs[0].downIsDown = false;
            break;
        case "Enter":
            this._inputs[0].startIsDown = false;
            break;
        case "KeyZ":
            this._inputs[0].jumpIsDown = false;
            break;
        case "KeyX":
            this._inputs[0].attackIsDown = false;
            break;
        }
    }

    private update (elapsedMS: number)  {
        let dt = 1 / this._targetFrameRate;
        this._elapsedTime += (PIXI.ticker.shared.elapsedMS / 1000);
        let numUpdates = 0;
        while (this._elapsedTime > dt) {
            numUpdates++;
            this._elapsedTime -= dt;
            // See if we can get gamepad input
            // TODO(ebuchholz): see if its possible to poll more frequently
            let gamePads = navigator.getGamepads();
            if (gamePads.length > 0) {
                for (let i = 0; i < 2; ++i) {
                    let gamePad = gamePads[i];
                    if (gamePad != null) {
                        let upPressed = gamePad.buttons[12].pressed;
                        let downPressed = gamePad.buttons[13].pressed;
                        let leftPressed = gamePad.buttons[14].pressed;
                        let rightPressed = gamePad.buttons[15].pressed;
                        let startPressed = gamePad.buttons[9].pressed;
                        let jumpPressed = gamePad.buttons[0].pressed;
                        let attackPressed = gamePad.buttons[1].pressed;

                        if (this._inputs[i].useKeyboard) {
                            if (upPressed || downPressed || leftPressed || rightPressed || 
                                startPressed || jumpPressed || attackPressed) {
                                this._inputs[i].useKeyboard = false;
                            }
                            else {
                                continue;
                            }
                        }

                        if (rightPressed && this._inputs[i].rightIsDown == false) {
                            this._inputs[i].rightJustPressed = true;
                        }
                        this._inputs[i].rightIsDown = rightPressed;
                        if (leftPressed && this._inputs[i].leftIsDown == false) {
                            this._inputs[i].leftJustPressed = true;
                        }
                        this._inputs[i].leftIsDown = leftPressed;
                        if (upPressed && this._inputs[i].upIsDown == false) {
                            this._inputs[i].upJustPressed = true;
                        }
                        this._inputs[i].upIsDown = upPressed;
                        if (downPressed && this._inputs[i].downIsDown == false) {
                            this._inputs[i].downJustPressed = true;
                        }
                        this._inputs[i].downIsDown = downPressed;
                        if (startPressed && this._inputs[i].startIsDown == false) {
                            this._inputs[i].startJustPressed = true;
                        }
                        this._inputs[i].startIsDown = startPressed;
                        if (jumpPressed && this._inputs[i].jumpIsDown == false) {
                            this._inputs[i].jumpJustPressed = true;
                        }
                        this._inputs[i].jumpIsDown = jumpPressed;
                        if (attackPressed && this._inputs[i].attackIsDown == false) {
                            this._inputs[i].attackJustPressed = true;
                        }
                        this._inputs[i].attackIsDown = attackPressed;
                    }
                }
            }

            this._stateManager.update(this._inputs, dt, this._renderer);
            TWEEN.update();
            this._renderer.render(this._stage);
            this.resize();

            for (let i = 0; i < this._inputs.length; ++i) {
                this._inputs[i].leftJustPressed = false;
                this._inputs[i].rightJustPressed = false;
                this._inputs[i].upJustPressed = false;
                this._inputs[i].downJustPressed = false;
                this._inputs[i].startJustPressed = false;
                this._inputs[i].jumpJustPressed = false;
                this._inputs[i].attackJustPressed = false;
            }
            if (numUpdates > 5) { this._elapsedTime = 0; } // prevent sprial of death
        }
    }

    public destroy () {
        this._stateManager.destroy();

        window.removeEventListener("resize", this._resizeCallback);
        window.removeEventListener("orientationchange", this._resizeCallback);

        this._stage.destroy();
        this._renderer.destroy();
    }
}
