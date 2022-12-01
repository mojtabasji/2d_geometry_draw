
# 2d_geometry_draw
draw shapes over geometry view with js

![2d_geometry](https://user-images.githubusercontent.com/50692768/205067597-448b192f-80cc-4c91-8e80-792e8a68ac4b.jpg)



 send canvas frame to constractor as jquery object 


    let frame = $("#frame");
    let canvas = new myCanvas(frame);
    
send Objects list to draw

     canvas.draw([{ x: 25, y: 25, type: "point", color: "red", w: 2, h: 2 }]);

    
    
