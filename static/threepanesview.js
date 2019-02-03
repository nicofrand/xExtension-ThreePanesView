(function() {
    'use strict';
    console.log("ThreePanesView FreshRSS extension detected");

    var _load = function()
    {
        if (!window.context) {
            console.log("ThreePanesView FreshRSS extension waiting for FreshRSS to be initialized");
            window.setTimeout(_load, 100);
            return;
        }

        // Only enable for normal display mode
        if (window.context.current_view !== "normal")
            return;

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
        var onArticleOpened = function(articleElement) {
            // Check the container has the expected height (which can sometimes be removed by
            //something else).
            if (!(wrapper.getAttribute("style") || "").includes("height"))
                _resize();

            panelContent.innerHTML = articleElement.querySelector(".flux_content").innerHTML;

            // We need to replace every id (and reference to it) by a new one to avoid duplicates.
            panelContent.querySelectorAll("[id]").forEach(function(node) {
                let ref = node.getAttribute("id");

                if (!ref)
                    return;

                let newRef = `3panes-${ref}`;

                // Set a new id value.
                node.setAttribute("id", newRef);

                // Update all references to it.
                panelContent.querySelectorAll(`[href="#${ref}"]`).forEach(function(elt) {
                    elt.setAttribute("href", `#${newRef}`);
                });
            });

            // Scroll to top of panel
            panel.scrollTop = 0;
        };

        document.addEventListener('freshrss:openArticle', function(event) {
            onArticleOpened(event.target);
        });

        // Legacy: deal with older FreshRSS versions without 'openArticle' event.
        if (!window.freshrssOpenArticleEvent) {
            stream.addEventListener("click", function(event)
            {
                var closestArticle = event.target.closest(".flux");

                if (closestArticle && stream.contains(closestArticle))
                    onArticleOpened(closestArticle);
            });
        }
    };

    if (document.readyState === "loading") {
        window.addEventListener("load", _load);
    } else {
        _load();
    }
}());
