(function() {
    'use strict';
    console.log("ThreePanesView FreshRSS extension detected");

    var load = function(event)
    {
        // Only enable for normal display mode
        var searchParams = window.location.search.replace(/^\?/, "").split('&');
        var size = searchParams.length;
        for (var i = 0; i < size; ++i)
        {
            var sp = searchParams[i].split("=");
            switch (sp[0])
            {
                case "c":
                    return;

                case "a":
                default:
                    if ((sp[1] || "normal") !== "normal")
                        return;
            }
        }

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

        var panel = document.getElementById("threepanesview");
        var panelContent = panel.querySelector(".flux");

        stream.addEventListener("click", function(event)
        {
            var closestArticle = event.target.closest(".flux");

            if (!closestArticle || !stream.contains(closestArticle))
                return;

            // Check the container has the expected height (which can sometimes be removed by
            //something else).
            if (!(wrapper.getAttribute("style") || "").includes("height"))
                _resize();

            panelContent.innerHTML = closestArticle.querySelector(".flux_content").innerHTML;

            // Scroll to top of panel
            panel.scrollTop = 0;
        });
    };

    if (document.readyState === "loading") {
        window.addEventListener("load", load);
    } else {
        load();
    }
}());
