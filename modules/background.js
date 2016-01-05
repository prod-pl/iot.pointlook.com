const requirejs = require('requirejs');

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function(require) {
    var dep = require('dependency');

    //The value returned from the function is
    //used as the module export visible to Node.
    return function () {};
});

require.config({
    paths: {
        "BigVideo": "bower_components/BigVideo.js/lib/bigvideo",
        "jquery": "bower_components/jquery/jquery",
        "jquery-ui": "bower_components/jquery-ui/ui/jquery-ui",
        "videojs": "bower_components/video.js/video",
        "imagesloaded": "bower_components/imagesloaded/imagesloaded",
        "eventEmitter/EventEmitter": "bower_components/eventEmitter/EventEmitter",
        "eventie/eventie": "bower_components/eventie/eventie"
    },
    shim: {
        "videojs": {exports: 'videojs'}
    }
});


const BV = require();

BV.init();
if (Modernizr.touch) {
    BV.show('http://dfcb.github.io/BigVideo.js/vids/dock.mp4',{ambient:true});
} else {
    BV.show('video.mp4',{ambient:true});
}
