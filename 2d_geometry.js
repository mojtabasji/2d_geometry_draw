
class myCanvas {
    constructor(frame) {
        this.frame = frame;
        this.Canvas = $("<canvas></canvas>").css({
            "position": "absolute",
            "top": "0px",
            "left": "0px",
            "width": "100%",
            "height": "100%",
            "background-color": "#303035"
        });

        this.frame.append(this.Canvas);
        this.backgroundColor = "white";


        this.xmin = -20;
        this.xmax = 20;
        this.ymin = -20;
        this.ymax = 20;
        this.rescale();
        this.lastObjects = [];

        this.ctx = this.Canvas[0].getContext("2d");
        let that = this;
        this.dragging = false;

        // event listener
        this.Canvas[0].addEventListener('mousewheel', function (e) {
            if (e === null) e = window.event;
            if (e && e.preventDefault) e.preventDefault();
            else e.returnValue = false;
            let delta = 0;
            if (e.wheelDelta) { // IE/Opera
                delta = e.wheelDelta / 120;
            } else if (e.detail) { // Mozilla/WebKit
                delta = -e.detail / 3;
            }
            if (delta < 0) that.zoomIn();
            else if (delta > 0) that.zoomOut();
        });

        this.Canvas[0].addEventListener('mousedown', function (e) {
            if (e === null) e = window.event;
            if (!(e.buttons === 1)) return;
            if (e && e.preventDefault) e.preventDefault();
            this.dragging = true;
            this.lastX = e.clientX;
            this.lastY = e.clientY;
        });

        this.Canvas[0].addEventListener('mouseup', function (e) {
            if (e === null) e = window.event;
            this.dragging = false;
            if (!(e.buttons === 1)) return;
            if (e && e.preventDefault) e.preventDefault();
        });

        this.Canvas[0].addEventListener('mousemove', function (e) {
            if (this.dragging) {
                let deltax = e.clientX - this.lastX;
                let deltay = e.clientY - this.lastY;
                that.pan(-deltax / (that.width / (that.xmax - that.xmin)), -deltay / (that.height / (that.ymax - that.ymin)));
                this.lastX = e.clientX;
                this.lastY = e.clientY;
            }
        });
    }

    rescale() {
        this.Canvas[0].width = this.frame.width();
        this.Canvas[0].height = this.frame.height();
        this.width = this.Canvas[0].width;
        this.height = this.Canvas[0].height;
        this.ymin = -this.height / this.width * this.xmax;
        this.ymax = -this.height / this.width * this.xmin;
    }

    //map x to pixel center of canvas
    x2px(x) { return (x - this.xmin) / (this.xmax - this.xmin) * this.width; }
    y2px(y) { return ((y * -1) - this.ymin) / (this.ymax - this.ymin) * this.height; }

    //map x size to pixel size
    x2pxs(x) { return x / (this.xmax - this.xmin) * this.width; }
    y2pxs(y) { return y / (this.ymax - this.ymin) * this.height; }

    draw(drawObjects) {
        let that = this;
        this.lastObjects = drawObjects;
        this.draw_grid();
        // this.draw_center_shape();
        for (let i in drawObjects) {
            let obj = drawObjects[i];
            switch (obj.type) {
                case "line":
                    this.ctx.lineWidth = obj.w || 1;
                    this.ctx.strokeStyle = obj.color || "#e0e0e0";
                    this.ctx.beginPath();
                    this.ctx.moveTo(that.x2px(obj.x), that.y2px(obj.y));
                    this.ctx.lineTo(that.x2px(obj.x1), that.y2px(obj.y1));
                    this.ctx.stroke();
                    break;
                case "path":
                    this.ctx.lineWidth = obj.w || 1;
                    this.ctx.strokeStyle = obj.color || "#e0e0e0";
                    this.ctx.beginPath();
                    this.ctx.moveTo(that.x2px(obj.x), that.y2px(obj.y));
                    this.ctx.lineTo(that.x2px(obj.x1), that.y2px(obj.y1));
                    this.ctx.stroke();
                    break;
                case "point":
                    var w = obj.w ? this.x2pxs(obj.w / 2) : 0.5;
                    this.ctx.fillStyle = obj.color || "#e0e0e0";
                    this.ctx.beginPath();
                    this.ctx.ellipse(that.x2px(obj.x), that.y2px(obj.y), w, w, Math.PI / 4, 0, 2 * Math.PI);
                    this.ctx.fill();
                    break;
                case "text":
                    this.ctx.fillStyle = obj.color || "#e0e0e0";
                    this.ctx.font = "12px Jetbrains Mono";
                    this.ctx.fillText(obj.text, this.x2px(obj.x), this.y2px(obj.y));
                    break;
                case "circle":
                    var w = obj.w ? this.x2pxs(obj.w / 2) : 1;
                    this.ctx.fillStyle = obj.color || "#e0e0e0";
                    this.ctx.beginPath();
                    this.ctx.ellipse(that.x2px(obj.x), that.y2px(obj.y), w, w, Math.PI / 4, 0, 2 * Math.PI);
                    this.ctx.fill();
                    break;
                case "arrow":
                    this.ctx.lineWidth = obj.lineWidth || 1;
                    this.ctx.strokeStyle = obj.color || "#e0e0e0";
                    this.ctx.beginPath();
                    let px = this.x2px(obj.data[0]);
                    let py = this.y2px(obj.data[1]);
                    this.ctx.moveTo(px, py);
                    for (let i = 1; i < obj.data.length / 2; i++) {
                        let px = this.x2px(obj.data[2 * i]);
                        let py = this.y2px(obj.data[2 * i + 1]);
                        this.ctx.lineTo(px, py);
                    }
                    this.ctx.stroke();
                    break;
                case "rectangle":
                    var w = obj.w ? this.x2pxs(obj.w / 2) : 2;
                    var h = obj.h ? this.y2pxs(obj.h / 2) : 1;
                    this.ctx.fillStyle = obj.color || "#e0e0e0";
                    this.ctx.beginPath();
                    this.ctx.fillRect(that.x2px(obj.x) - (w / 2), that.y2px(obj.y) - (h / 2), w, h);
                    break;
                case "ellipse":
                    var w = obj.w ? this.x2pxs(obj.w / 2) : 0.5;
                    var h = obj.h ? this.y2pxs(obj.h / 2) : 1;
                    this.ctx.fillStyle = obj.color || "#e0e0e0";
                    this.ctx.beginPath();
                    this.ctx.ellipse(that.x2px(obj.x), that.y2px(obj.y), w, h, 0, 0, 2 * Math.PI);
                    this.ctx.fill();
                    break;
                default:
                    console.log("unknown type");
                    break;
            }
        }
    }

    draw_grid() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = "#303035";
        this.ctx.fillRect(0, 0, this.width, this.height);
        // draw grid line width 1px and color white
        if (this.xmax - this.xmin < 50) {
            this.ctx.beginPath();
            this.ctx.strokeStyle = "#404040";
            this.ctx.lineWidth = 1;
            for (let i = parseInt(this.xmin); i < parseInt(this.xmax) + 1; i += 1) {
                this.ctx.moveTo(this.x2px(i), 0);
                this.ctx.lineTo(this.x2px(i), this.y2px(-this.ymax));
            }
            for (let i = parseInt(this.ymin); i < parseInt(this.ymax) + 1; i += 1) {
                this.ctx.moveTo(0, this.y2px(-i));
                this.ctx.lineTo(this.x2px(this.xmax), this.y2px(-i));
            }
            this.ctx.stroke();
        }

        this.ctx.beginPath();
        this.ctx.strokeStyle = "#606060";
        this.ctx.lineWidth = 1;
        for (let i = parseInt(this.xmin / 5) * 5; i < parseInt(this.xmax) + 1; i += 5) {
            this.ctx.moveTo(this.x2px(i), 0);
            this.ctx.lineTo(this.x2px(i), this.y2px(-this.ymax));
        }
        for (let i = parseInt(this.ymin / 5) * 5; i < parseInt(this.ymax) + 1; i += 5) {
            this.ctx.moveTo(0, this.y2px(-i));
            this.ctx.lineTo(this.x2px(this.xmax), this.y2px(-i));
        }
        this.ctx.stroke();




        this.ctx.closePath();
    }

    draw_center_shape() {
        this.ctx.beginPath();
        this.ctx.strokeStyle = "blue";
        this.ctx.lineWidth = 1;
        this.ctx.moveTo(this.x2px(0), this.y2px(0));
        this.ctx.lineTo(this.x2px(0), this.y2px(this.ymax));
        this.ctx.stroke();
        this.ctx.strokeStyle = "green";
        this.ctx.moveTo(this.x2px(0), this.y2px(0));
        this.ctx.lineTo(this.x2px(this.xmax), this.y2px(0));
        this.ctx.stroke();
        this.ctx.closePath();

    }

    pan(deltax, deltay) {
        this.xmin += deltax;
        this.xmax += deltax;
        this.ymin += deltay;
        this.ymax += deltay;
        this.draw(this.lastObjects);
    }

    // mouse zoom in and zoom out
    zoomIn() {
        if (this.xmax - this.xmin > 2 && this.ymax - this.ymin > 2) {
            let dimenRelat = (this.ymax - this.ymin) / (this.xmax - this.xmin);
            this.xmin += 1;
            this.xmax -= 1;
            this.ymin += dimenRelat;
            this.ymax -= dimenRelat;
            this.draw(this.lastObjects);
        }
    }

    zoomOut() {
        let dimenRelat = (this.ymax - this.ymin) / (this.xmax - this.xmin);
        this.xmin -= 1;
        this.xmax += 1;
        this.ymin -= dimenRelat;
        this.ymax += dimenRelat;
        this.draw(this.lastObjects);
    }
}


function onResize() {
    global_var.that.rescale();
    global_var.that.draw();
}

function showdimantions() {
    let dim = $("#dim");
    let frame = $("#frame");
    dim.text(frame.width() + " x " + frame.height());
}

function increase() {
    let frame = $("#frame");
    frame.css({
        "width": frame.width() + 10,
    });
    showdimantions();
    onResize();
}

function decrease() {
    let frame = $("#frame");
    frame.css({
        "width": frame.width() - 10,
    });
    showdimantions();
    onResize();
}


//  use this class to draw a graph

const global_var = { that: null }

$(document).ready(function () {
    let frame = $("#frame");
    let canvas = new myCanvas(frame);
    global_var.that = canvas;
    global_var.that.draw();
    showdimantions();
});

function draw() {
    global_var.that.draw([
        { x: -10, y: -10, x1: 10, y1: 10, type: "line", color: "red" },
        { x: 15, y: 15, type: "point", color: "red", w: 2, h: 2 },
        { x: 0, y: 15, type: "ellipse", color: "red", w: 2, h: 4 },
        { x: 15, y: 0, type: "rectangle", color: "green", w: 4, h: 2 },
        { x: 0, y: 0, type: "text", text: "hello world", color: "red" },
    ]);
}