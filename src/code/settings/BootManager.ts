/**
 * Created by erik.buchholz on 3/7/2017.
 */
 //import MobileDetect = require("mobile-detect");
import {GameSettings} from "./GameSettings";
import {Devices} from "../const/Enums";

/**
 * Manager for determining some settings based on device, browser, etc.
 */
export class BootManager {
    
//private _mobileDetect: MobileDetect;
    
    /**
     * Detects current device and browser and sets some settings
     */
    public init (): void {
    //this._mobileDetect = new MobileDetect(window.navigator.userAgent);
        this.determineDevice();
        this.determineCapability();
    }
    
    /**
     * Determines the current device
     */
    private determineDevice (): void {
    //if (this._mobileDetect.mobile()) {
    //       GameSettings.currentDevice = Devices.PHONE;
    //   }
    //   else if (this._mobileDetect.tablet()) {
    //       GameSettings.currentDevice = Devices.TABLET;
    //   }
    //   else {
    //       GameSettings.currentDevice = Devices.DESKTOP;
    //   }
    }
    
    /**
     * Determines some device or browser specific settings
     */
    private determineCapability (): void {
        if (GameSettings.currentDevice !== Devices.DESKTOP) {
            GameSettings.useMobileInputEvents = true;
        }
        else {
            GameSettings.useMobileInputEvents = false;
        }
    }
}
