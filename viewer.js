import * as OV from 'online-3d-viewer';

window.addEventListener ('load', () => {
    // tell the engine where to find the libs folder
    OV.SetExternalLibLocation ('node_modules/online-3d-viewer/libs');
    // init all viewers on the page
    OV.Init3DViewerFromUrlList(
        window.document.getElementById('viewer'),
        ["models/2X6-BENCH.stp"]
    );
});
