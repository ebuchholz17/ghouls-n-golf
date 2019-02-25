/**
 * Created by erik.buchholz on 3/8/2017.
 */
import * as FontFaceObserver from "fontfaceobserver";

import {Events} from "../const/Events";
import {GameSettings} from "../settings/GameSettings";
import {State} from "./State";
import {StateManager} from "./StateManager";
import {StateNames} from "../const/Enums";

/**
 * State for loading assets. 
 */
export class AssetLoaderState extends State {

    private _assetsLoaded: boolean = false;
    private _fontsLoaded: boolean = false;
    
    /**
     * Calls the base State constructor
     * @param {StateManager} controller  A reference to the state controller
     * @param {PIXI.Container} stage        A reference the stage, the main PIXI container
     */
    public constructor (controller: StateManager, stage: PIXI.Container) {
        super(controller, stage);
    }

    /**
     * Tells the PIXI.loader to load all of the assets!
     */
    public init (): void {
        // Resets any assets loaded already: this lets us replay
        PIXI.loader.reset();
        
        // Texture atlas
        PIXI.loader.add("courseMap", "assets/courseData.png"); // TODO(ebuchholz): use different art for map
        PIXI.loader.add("courseData", "assets/courseData.png");
        PIXI.loader.add("menu_arrow", "assets/menu_arrow.png");

        // golfers
        PIXI.loader.add("golfer_red_idle", "assets/golfer_red_idle.png");
        PIXI.loader.add("golfer_red_swing_0", "assets/golfer_red_swing_0.png");
        PIXI.loader.add("golfer_red_swing_1", "assets/golfer_red_swing_1.png");
        PIXI.loader.add("golfer_red_swing_2", "assets/golfer_red_swing_2.png");
        PIXI.loader.add("golfer_red_swing_3", "assets/golfer_red_swing_3.png");
        PIXI.loader.add("golfer_blue_idle", "assets/golfer_blue_idle.png");
        PIXI.loader.add("golfer_blue_swing_0", "assets/golfer_blue_swing_0.png");
        PIXI.loader.add("golfer_blue_swing_1", "assets/golfer_blue_swing_1.png");
        PIXI.loader.add("golfer_blue_swing_2", "assets/golfer_blue_swing_2.png");
        PIXI.loader.add("golfer_blue_swing_3", "assets/golfer_blue_swing_3.png");
        PIXI.loader.add("golfer_ghost", "assets/golfer_ghost.png");

        // golf ball
        PIXI.loader.add("golf_ball_0", "assets/golf_ball_0.png");
        PIXI.loader.add("golf_ball_1", "assets/golf_ball_1.png");
        PIXI.loader.add("golf_ball_2", "assets/golf_ball_2.png");
        PIXI.loader.add("golf_ball_3", "assets/golf_ball_3.png");

        PIXI.loader.add("trajectory_dot", "assets/trajectory_dot.png");

        // clubs
        PIXI.loader.add("driver", "assets/driver.png");
        PIXI.loader.add("iron", "assets/iron.png");
        PIXI.loader.add("wedge", "assets/wedge.png");
        PIXI.loader.add("putter", "assets/putter.png");
        PIXI.loader.add("club_arrow", "assets/club_arrow.png");

        // UI
        PIXI.loader.add("wind_arrow", "assets/wind_arrow.png");
        PIXI.loader.add("wind_arrow_diagonal", "assets/wind_arrow_diagonal.png");
        PIXI.loader.add("heart", "assets/heart.png");
        PIXI.loader.add("font", "assets/fonts/font.fnt");

        // Level tiles
        PIXI.loader.add("bunker", "assets/tiles/bunker.png");
        PIXI.loader.add("bunker_up", "assets/tiles/bunker_up.png");
        PIXI.loader.add("bunker_down", "assets/tiles/bunker_down.png");
        PIXI.loader.add("bunker_left", "assets/tiles/bunker_left.png");
        PIXI.loader.add("bunker_right", "assets/tiles/bunker_right.png");
        PIXI.loader.add("bunker_upleft", "assets/tiles/bunker_upleft.png");
        PIXI.loader.add("bunker_upright", "assets/tiles/bunker_upright.png");
        PIXI.loader.add("bunker_downleft", "assets/tiles/bunker_downleft.png");
        PIXI.loader.add("bunker_downright", "assets/tiles/bunker_downright.png");

        PIXI.loader.add("fairway", "assets/tiles/fairway.png");
        PIXI.loader.add("fairway_up", "assets/tiles/fairway_up.png");
        PIXI.loader.add("fairway_down", "assets/tiles/fairway_down.png");
        PIXI.loader.add("fairway_left", "assets/tiles/fairway_left.png");
        PIXI.loader.add("fairway_right", "assets/tiles/fairway_right.png");
        PIXI.loader.add("fairway_upleft", "assets/tiles/fairway_upleft.png");
        PIXI.loader.add("fairway_upright", "assets/tiles/fairway_upright.png");
        PIXI.loader.add("fairway_downleft", "assets/tiles/fairway_downleft.png");
        PIXI.loader.add("fairway_downright", "assets/tiles/fairway_downright.png");

        PIXI.loader.add("oob", "assets/tiles/oob.png");
        PIXI.loader.add("oob_up", "assets/tiles/oob_up.png");
        PIXI.loader.add("oob_down", "assets/tiles/oob_down.png");
        PIXI.loader.add("oob_left", "assets/tiles/oob_left.png");
        PIXI.loader.add("oob_right", "assets/tiles/oob_right.png");
        PIXI.loader.add("oob_upleft", "assets/tiles/oob_upleft.png");
        PIXI.loader.add("oob_upright", "assets/tiles/oob_upright.png");
        PIXI.loader.add("oob_downleft", "assets/tiles/oob_downleft.png");
        PIXI.loader.add("oob_downright", "assets/tiles/oob_downright.png");

        PIXI.loader.add("rough", "assets/tiles/rough.png");
        PIXI.loader.add("rough_up", "assets/tiles/rough_up.png");
        PIXI.loader.add("rough_down", "assets/tiles/rough_down.png");
        PIXI.loader.add("rough_left", "assets/tiles/rough_left.png");
        PIXI.loader.add("rough_right", "assets/tiles/rough_right.png");
        PIXI.loader.add("rough_upleft", "assets/tiles/rough_upleft.png");
        PIXI.loader.add("rough_upright", "assets/tiles/rough_upright.png");
        PIXI.loader.add("rough_downleft", "assets/tiles/rough_downleft.png");
        PIXI.loader.add("rough_downright", "assets/tiles/rough_downright.png");

        PIXI.loader.add("green_up", "assets/tiles/green_up.png");
        PIXI.loader.add("green_0", "assets/tiles/green_0.png");
        PIXI.loader.add("green_1", "assets/tiles/green_1.png");

        // Player character
        PIXI.loader.add("golfman", "assets/golfman.png");
        PIXI.loader.add("golfman_punch", "assets/golfman_punch.png");
        PIXI.loader.add("golfman_run_0", "assets/golfman_run_0.png");
        PIXI.loader.add("golfman_run_1", "assets/golfman_run_1.png");
        PIXI.loader.add("golfman_appear_0", "assets/golfman_appear_0.png");
        PIXI.loader.add("golfman_appear_1", "assets/golfman_appear_1.png");
        PIXI.loader.add("golfman_appear_2", "assets/golfman_appear_2.png");

        // enemies
        PIXI.loader.add("ghoul_0", "assets/ghoul_0.png");
        PIXI.loader.add("ghoul_1", "assets/ghoul_1.png");
        PIXI.loader.add("skeleton", "assets/skeleton.png");
        PIXI.loader.add("ghost_0", "assets/ghost_0.png");
        PIXI.loader.add("ghost_1", "assets/ghost_1.png");

        // attacks
        PIXI.loader.add("hitbox", "assets/hitbox.png");
        PIXI.loader.add("hurtbox", "assets/hurtbox.png");

        // flag
        PIXI.loader.add("flag", "assets/flag.png");
        PIXI.loader.add("flagBar", "assets/flagBar.png");
        PIXI.loader.add("flagIcon", "assets/flagIcon.png");

        PIXI.loader.once("complete", this.onAssetsLoaded, this);
        PIXI.loader.load();

        // Fonts
        //let fontStyle = require("../../styles/fonts.less");
        //fontStyle = fontStyle.replace(/%RESOURCE_PATH%/g, "assets");

        //let css = document.createElement("style");
        //css.setAttribute("type", "text/css");
        //css.innerHTML = fontStyle;
        //document.getElementsByTagName("head")[0].appendChild(css);
        //new FontFaceObserver("monaco").load().then(
        //    function () {
        //        this.onFontsLoaded();
        //    }.bind(this),
        //    function () {
        //        console.log("Failed to load fonts");
        //    }
        //);
    }
    
    /**
     * Handles PIXI loader errors
     * @param error
     * @param loader
     * @param resource
     */
    private onPIXILoaderError(error: Error, loader: PIXI.loaders.Loader, resource: PIXI.loaders.Resource): void {
        console.log("Error loading asset: " + resource.name);
        if (resource.name === "gameAtlas" || resource.name === "gameAtlas_image") {
            this.onLoaderError("Failed to load essential asset: " + resource.name);
        }
    }
    
    /**
     * Logs an error message
     * @param {string} message  The message describing the error
     */
    private onLoaderError (message: string): void {
        console.log(message);
    }
    
    /**
     * Post-load handling. Saves a reference to the game atlas in GameSettings, and signals the state controller that
     * asset loading is complete
     * @param {PIXI.loaders.loader} loader                  Reference to the PIXI loader
     * @param {PIXI.loaders.ResourceDictionary} resources  Reference to the loaded resources
     */
    private onAssetsLoaded (loader: PIXI.loaders.Loader, resources: PIXI.loaders.ResourceDictionary): void {
        //if (!resources["gameAtlas"] || !resources["gameAtlas_image"]) { 
        //    this.onLoaderError("Failed to load game atlas!"); 
        //    return;
        //}
        //let atlasStatus = resources["gameAtlas"].xhr.status.toString();
        //if (atlasStatus.charAt(0) !== "2" && atlasStatus.charAt(0) !== "3") {
        //    this.onLoaderError("Failed to load game atlas!");
        //}
        //GameSettings.gameAtlas = resources["gameAtlas"].textures;
        //GameSettings.backgroundTexture = resources["background"].texture;

        GameSettings.textures = [];
        for (let resource in resources) {
            if (resources[resource]["bitmapFont"]) {
                // might need to do something here
            }
            else {
                GameSettings.textures[resource] = resources[resource].texture;
                GameSettings.textures[resource].baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
            }
        }
        
        this._assetsLoaded = true;
        this._fontsLoaded = true; // QQQ
        this.checkAssetsAndFontsLoaded();
    }

    private onFontsLoaded (): void {
        this._fontsLoaded = true;
        this.checkAssetsAndFontsLoaded();
    }

    private checkAssetsAndFontsLoaded (): void {
        if (this._assetsLoaded && this._fontsLoaded) {
            this._manager.startState(StateNames.TITLE_SCREEN);
        }
    }
}
