/**
 * Created by erik.buchholz on 3/8/2017.
 */
import {Input} from "../Game";
import {StateManager} from "./StateManager";

/**
 * A single state that effectively is a game state. One of these is active at a time. It is updated every frame and
 * resized when the parent container resizes
 */
export class State {

    protected _manager: StateManager;
    protected _stage: PIXI.Container;
    
    /**
     * Saves a reference to the state manager for emitting events and the stage for adding graphics to the screen
     * @param {StateManager} manager  A reference to the state manager
     * @param {PIXI.Container} stage        A reference the stage, the main PIXI container
     */
    public constructor (manager: StateManager, stage: PIXI.Container) {
        this._manager = manager;
        this._stage = stage;
    }
    
    /**
     * Should do any setup needed for the state
     */
    public init (renderer?: any): void {
        
    }
    
    /**
     * Handles any logic that should be updated every frame
     */
    public update (inputs: Input[], dt: number, renderer?: any): void {
        
    }
    
    /**
     * Resizes any graphical content
     */
    public resize (): void {
        
    }
    
    /**
     * Cleanup when the interactive ends or when switching states
     */
    public destroy (): void {
        
    }
}
    
