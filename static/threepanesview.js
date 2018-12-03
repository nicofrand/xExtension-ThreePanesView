(function() {
    'use strict';
    console.log("ThreePanesView FreshRSS extension detected");

    var load = function(event)
    {
        var stream = document.getElementById("stream");
        var content = stream.querySelector(".flux.current");
        var html = content ? content.querySelector(".flux_content").innerHTML : "";
        stream.insertAdjacentHTML("beforebegin", `<div id="threepanesviewcontainer"></div>`);
        var wrapper = document.getElementById("threepanesviewcontainer");
        wrapper.appendChild(stream);
        wrapper.insertAdjacentHTML("beforeend", `<div id="threepanesview"><div class="flux">${html}</div></div>`);

        var _resize = function()
        {
            var topOffset = wrapper.offsetTop;

            // Some CSS is not loaded yet
            if (topOffset > 500)
                window.setTimeout(_resize, 10);
            else
                wrapper.style.height = `${window.innerHeight - topOffset}px`;
        };
        _resize();
        window.addEventListener("resize", _resize);

        var panel = document.getElementById("threepanesview").querySelector(".flux");
        stream.querySelectorAll(".flux").forEach((function(art)
        {
            art.addEventListener("click", function(event)
            {
                // Check the container has the expected height (which can sometimes be removed by
                //something else).
                if (!(wrapper.getAttribute("style") || "").includes("height"))
                    _resize();

                panel.innerHTML = event.currentTarget.querySelector(".flux_content").innerHTML;

                // Scroll to top of panel
                panel.scrollTop = 0;
            })
        }));
    };

    if (document.readyState === "loading") {
        window.addEventListener("load", load);
    } else {
        load();
    }
}());
