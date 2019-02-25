/**
 * Created by erik.buchholz on 3/7/2017.
 */

import {Devices} from "../const/Enums";

/**
 * Class that provides global access within the interactive to common properties, such as game atlas textures, game 
 * width and height, etc.
 */
export class GameSettings {
    public static textures: any; // Access to loaded textures

    // Access to PIXI textures in the game atlas, used to create PIXI sprites
    public static gameAtlas: PIXI.loaders.TextureDictionary;
    public static backgroundTexture: any;
    public static currentDevice: Devices;

    public static useMobileInputEvents: boolean = false; // Whether to use mouse or touch events
    public static cheatsEnabled: boolean = true;
    
    // Current size of the game
    public static width: number = 50;
    public static height: number = 50;
    public static nativeWidth: number = 768;
    public static nativeHeight: number = 432;

    public static numPlayers: number = 1;
    public static showHitBoxes: boolean = false;
    public static winningPlayer: number = 1;
}
