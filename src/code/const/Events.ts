/**
 * Created by erik.buchholz on 3/8/2017.
 */

/**
 * List of events that can occur in teh game. They are emitted to and listened to with PIXI.utils.EventEmitters
 */
export class Events {
    // Emitted when assets are done loading in AssetLoaderScene
    public static readonly ASSETS_LOADED: string = "AssetsLoaded";
    public static readonly MOVE_MADE: string = "MoveMade"; // Whenever the player makes a move
}
