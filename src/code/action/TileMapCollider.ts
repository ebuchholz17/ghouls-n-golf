import {CollisionPoints} from "./ActionGame";
import {TileMap} from "./ActionGame";
import {MovementProperties} from "./ActionGame";

export class TileMapCollider {

    public static handleCollisions (tileMap: TileMap, 
                                    collisionPoints: CollisionPoints,
                                    moveProps: MovementProperties) 
    {
        if (moveProps.noClip) { return; }
        let i, depth;
        let xResult = 0;
        let yResult = 0;

        let collideLeft = false;
        let collideRight = false;
        let collideUp = false;
        let collideDown = false;
        moveProps.bumpedHead = false;

        depth = 0;
        if (moveProps.velocity.x > 0) {
            let rightPoints = collisionPoints.right;
            for (i = 0; i < rightPoints.length; ++i) {
                depth = TileMapCollider.getTilePenetrationDepthRight(tileMap, 
                                                                     rightPoints[i], 
                                                                     moveProps);
                if (depth > xResult) {
                    xResult = depth;
                    collideRight = true;
                }
            }
        }
        else if (moveProps.velocity.x < 0) {
            let leftPoints = collisionPoints.left;
            for (i = 0; i < leftPoints.length; ++i) {
                depth = TileMapCollider.getTilePenetrationDepthLeft(tileMap, 
                                                                    leftPoints[i], 
                                                                    moveProps);
                if (depth > xResult) {
                    xResult = depth;
                    collideLeft = true;
                }
            }
        }

        if (moveProps.velocity.y < 0) {
            let upPoints = collisionPoints.top;
            for (i = 0; i < upPoints.length; ++i) {
                depth = TileMapCollider.getTilePenetrationDepthUp(tileMap, 
                                                                  upPoints[i], 
                                                                  moveProps);
                if (depth > yResult) {
                    yResult = depth;
                    collideUp = true;
                }
            }
        }
        else {
            let downPoints = collisionPoints.bottom;
            for (i = 0; i < downPoints.length; ++i) {
                depth = TileMapCollider.getTilePenetrationDepthDown(tileMap, 
                                                                    downPoints[i], 
                                                                    moveProps);
                if (depth > yResult) {
                    yResult = depth;
                    collideDown = true;
                }
            }
        }

        if (Math.abs(xResult) > Math.abs(yResult)) {
            if (collideLeft) {
                moveProps.position.x += xResult;
                moveProps.velocity.x = 0;
            }
            else if (collideRight) {
                moveProps.position.x -= xResult;
                moveProps.velocity.x = 0;
            }

            if (collideDown) {
                if (!moveProps.onGround) {
                    moveProps.position.y -= (yResult - 1);
                    moveProps.onGround = true;
                    moveProps.velocity.y = 0;
                }
            }
            else {
                moveProps.onGround = false;
            }

            if (collideUp) {
                moveProps.bumpedHead = true;
                moveProps.position.y += yResult;
                moveProps.velocity.y = 5;
            }
        }
        else { 
            if (collideDown) {
                if (!moveProps.onGround) {
                    moveProps.position.y -= (yResult - 1);
                    moveProps.onGround = true;
                    moveProps.velocity.y = 0;
                }
            }
            else {
                moveProps.onGround = false;
            }

            if (collideUp) {
                moveProps.bumpedHead = true;
                moveProps.position.y += yResult;
                moveProps.velocity.y = 1;
            }
            if (collideLeft) {
                moveProps.position.x += xResult;
                moveProps.velocity.x = 0;
            }
            else if (collideRight) {
                moveProps.position.x -= xResult;
                moveProps.velocity.x = 0;
            }
        }

    }

    public static getTilePenetrationDepthDown (tileMap: TileMap, point: PIXI.Point, moveProps: MovementProperties) {
        "use strict";
        var pointPos = new PIXI.Point(point.x + moveProps.position.x, point.y + moveProps.position.y);
        var tileX = Math.floor(pointPos.x / 8);
        var tileY = Math.floor(pointPos.y / 8);
        if (!tileMap.tilesByXY[tileX]) { return 0; }
        var tile = tileMap.tilesByXY[tileX][tileY];
        if (!tile || tile.passable) { return 0; }

        var tilePos = new PIXI.Point(tileX * 8, tileY * 8);
        return pointPos.y - tilePos.y;
    }

    public static getTilePenetrationDepthUp (tileMap: TileMap, point: PIXI.Point, moveProps: MovementProperties) {
        "use strict";
        var pointPos = new PIXI.Point(point.x + moveProps.position.x, point.y + moveProps.position.y);
        var tileX = Math.floor(pointPos.x / 8);
        var tileY = Math.floor(pointPos.y / 8);
        if (!tileMap.tilesByXY[tileX]) { return 0; }
        var tile = tileMap.tilesByXY[tileX][tileY];
        if (!tile || tile.passable) { return 0; }

        var tilePos = new PIXI.Point(tileX * 8, tileY * 8);
        return (tilePos.y + 8) - pointPos.y;
    }

    public static getTilePenetrationDepthLeft (tileMap: TileMap, point: PIXI.Point, moveProps: MovementProperties) {
        "use strict";
        var pointPos = new PIXI.Point(point.x + moveProps.position.x, point.y + moveProps.position.y);
        var tileX = Math.floor(pointPos.x / 8);
        var tileY = Math.floor(pointPos.y / 8);
        if (!tileMap.tilesByXY[tileX]) { return 0; }
        var tile = tileMap.tilesByXY[tileX][tileY];
        if (!tile || tile.passable) { return 0; }

        var tilePos = new PIXI.Point(tileX * 8, tileY * 8);
        return (8 + tilePos.x) - pointPos.x;
    }

    public static getTilePenetrationDepthRight (tileMap: TileMap, point: PIXI.Point, moveProps: MovementProperties) {
        "use strict";
        var pointPos = new PIXI.Point(point.x + moveProps.position.x, point.y + moveProps.position.y);
        var tileX = Math.floor(pointPos.x / 8);
        var tileY = Math.floor(pointPos.y / 8);
        if (!tileMap.tilesByXY[tileX]) { return 0; }
        var tile = tileMap.tilesByXY[tileX][tileY];
        if (!tile || tile.passable) { return 0; }

        var tilePos = new PIXI.Point(tileX * 8, tileY * 8);
        return pointPos.x - tilePos.x;
    }

}
