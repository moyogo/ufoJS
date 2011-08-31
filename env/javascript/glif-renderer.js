if(typeof console == 'undefined'){
    console = {log:function(){}};
}
define([
    'dojo/dojo',
    'graphicore',
    'graphicore/errors',
    'graphicore/tools/pens/AbstractPen',
    'graphicore/tools/pens/BasePen',
    'graphicore/UFO/glyphFactories',
    'graphicore/UFO/main',
    'graphicore/tools/pens/main',
    'graphicore/tools/misc/transform',
    'graphicore/tools/pens/testPens',
    'graphicore/tools/pens/TransformPen',
    'graphicore/tools/pens/PointToSegmentPen',
    'graphicore/tools/pens/SVGPen'

],
function(
    // dojo is loaded first, but dojo is not returned by the dojo loading
    // script and no define is used there. Instead its defined globally
    _pass_dojo,
    main,
    errors,
    AbstractPen,
    BasePen,
    glyphFactories,
    UFO,
    pens,
    transform,
    testPens,
    TransformPen,
    PointToSegmentPen,
    SVGPen
){

 
    var svgns = 'http://www.w3.org/2000/svg',
        svg = document.createElementNS(svgns, 'svg');
    svg.setAttribute('width', '500px');
    svg.setAttribute('height', '500px');
    svg.setAttribute('style', 'background:#eee');
    document.body.appendChild(svg);
    
    var drawPoint = function(point, color, r) {
        if(r === undefined) r = 3;
        pointElm = document.createElementNS(svgns, 'circle');
        pointElm.setAttribute('r', r);
        pointElm.setAttribute('cx', point[0]);
        pointElm.setAttribute('cy', point[1]);
        pointElm.setAttribute('fill', color);
        svg.appendChild(pointElm);
    }
    
    var drawLine = function(segments, color) {
        var path = document.createElementNS(svgns, 'path');
        var d = '';
        var cmd;
        path.setAttribute('style', 'fill:none;stroke:'+color+';stroke-width:1');
        for(var i in segments) {
            console.log(segments[i].length);
            if(segments[i].length == 1) {
                cmd = 'L';
                if(i == 0) {
                     cmd = 'M'
                }
                
            }else if(segments[i].length == 2){
                cmd = 'Q';
            }else if(segments[i].length == 3){
                cmd = 'C';
            }
            d += cmd;
            for(var j in segments[i]) {
                d += segments[i][j].join(' ') + ' ';
            }
        }
        path.setAttribute('d', d);
        svg.appendChild(path)
    }
    
    var drawSegPts = function(segments, color1, color2, r) {
        for(var i in segments) {
            for(var j in segments[i]) {
                var color = color1;
                if(segments[i].length - 1 == j)
                    color = color2;
                drawPoint(segments[i][j], color, r);
            }
        }
    }
    
    
    var start = [10, 10];
    drawPoint(start, 'black');
    var pts = [ [100,200],[400,100],[455,300.345] ];
    for (var i in pts) {
        drawPoint(pts[i], 'rgba(125,0,0,.5)', 6);
    }
    
    var segments = pens.decomposeSuperBezierSegment(pts);
    console.log(segments);
    console.log(pens.decomposeSuperBezierSegment([ [100,200],[400,100],[455,300.345], [125, 450], [75,230.345] ] ) );
    //this implementation, input = [ [100,200],[400,100],[455,300.345], [125, 450], [75,230.345] ];
    [
        [
            [100, 200],
            [250, 150],
            [334.16666666666663, 158.39083333333332]
        ],
        [
            [418.3333333333333, 166.78166666666667],
            [436.6666666666667, 233.56333333333333],
            [363.33333333333337, 304.3679166666667]
        ],
        [
            [290, 375.1725],
            [125, 450],
            [75, 230.345]
        ]
    ];
    
    //python fonttools input = [ [100,200],[400,100],[455,300.345], [125, 450], [75,230.345] ]
    var psegments = [
        [
            [100, 200],
            [250.0, 150.0],
            [334.16666666666663, 158.39083333333332]
        ],
        [
            [418.3333333333333, 166.78166666666667],
            [436.6666666666667, 233.56333333333333],
            [363.33333333333337, 304.3679166666667]
        ],
        [
            [290.0, 375.1725],
            [125, 450],
            [75, 230.345]
        ]
    ];
    
    var qsegments = pens.decomposeQuadraticSegment(pts);
    

    drawSegPts(segments, 'lime', 'green', 4);
    drawSegPts(qsegments, 'pink', 'purple', 3);
    
    segments.unshift([start]);
    qsegments.unshift([start]);
    drawLine(segments, 'grey');
    drawLine(qsegments, 'salmon');
    //
    
    var receiveGlif = function(glif, ioargs) {
        // mit dem richtigen content type waere das nicht noetig und man koennte
        // gleich fromGlifDocument() nehmen
        var contours = glyphFactories.fromGlifString(glif);
        var svgns = 'http://www.w3.org/2000/svg',
            svg = document.createElementNS(svgns, 'svg'),
            pathElement = document.createElementNS(svgns, 'path'),
            gElement = document.createElementNS(svgns, 'g'),
            svgPen = new SVGPen(pathElement, {}),
            pointPen = new PointToSegmentPen(svgPen);
        svg.setAttribute('width', '500px');
        svg.setAttribute('height', '1000px');
        svg.setAttribute('style', 'background:#abc');
        
        gElement.setAttribute('transform', 'matrix(1, 0, 0, -1, 0, 800)');
        gElement.appendChild(pathElement);    
        svg.appendChild(gElement);

        for(var i=0; i < contours.length ;i++) {
            pointPen.beginPath();
            var path = contours[i];
            for(var j=0; j < path.length; j++) {
                var point = path[j],
                    pt = [point.x, point.y,],
                    segmentType = point.type,
                    smooth = point.smooth,
                    name = point.name;
                pointPen.addPoint(pt, segmentType, smooth, name);
            }
            pointPen.endPath();
        }

        document.body.insertBefore(svg, document.body.firstChild);
    }

    dojo.addOnLoad(function() {
        dojo.xhrGet({
            // The URL to request
            url: './ufos/DemoFont.ufo/glyphs/G_.glif',
            //handleAs: 'xml',//geht nur mit dem richtigen content type header
            load: receiveGlif
        });
    });
});
