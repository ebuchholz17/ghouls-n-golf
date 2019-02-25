/**
 * Created by erik.buchholz on 3/8/2017.
 */
import * as PIXI from "pixi.js";
import {Input} from "../Game";
import {State} from "./State";

/**
 * Manages game states. Has functions to start, update and resize each state
 */
export class StateManager {
    
    public events: PIXI.utils.EventEmitter; // Event emitter the states can use to send events to InteractiveMain
    
    private _activeState: State;
    private _renderer: any;
    private _states: { [key: number]: State };
    private _stage: PIXI.Container;
    
    /**
     * Saves a references to the stage
     * @param {PIXI.Container} stage    Reference to the main PIXI container
     */
    public constructor (stage: PIXI.Container, renderer: any) {
        this._stage = stage;
        
        this.events = new PIXI.utils.EventEmitter();
        this._activeState = null;
        this._states = {};
        this._renderer = renderer;
    }
    
    /**
     * Adds a state to the dictionary of states
     * @param {StateNames} key  Name of the state
     * @param {State} state     The state to add
     */
    public registerState (key: number, state: State): void {
        this._states[key] = state;
    }
    
    /**
     * Starts a state: destroy the current state (if there is one), and initializes the specified state
     * @param {StateNames} key  The name of the state to start
     */
    public startState (key: number): void {
        if (this._activeState) {
            this._activeState.destroy();
        }
        
        this._activeState = this._states[key];
        if (this._activeState) {
            this._activeState.init(this._renderer);
        }
    }
    
    /**
     * Updates the current state
     */
    public update (inputs: Input[], dt: number, renderer): void {
        if (this._activeState) {
            this._activeState.update(inputs, dt, renderer);
        }
    }
    
    /**
     * Resizes the current state. The height of the interactive may be determined by the current state
     */
    public resize (): void {
        if (this._activeState) {
            this._activeState.resize();
        }
    }
    
    /**
     * Destroys all of the states
     */
    public destroy (): void {
        for (let key in this._states) {
            this._states[key].destroy();
        }
    }
}
