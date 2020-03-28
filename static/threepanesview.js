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
        if (window.context.current_view !== "normal" || window.innerWidth < 800)
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
            {
                var availableHeight = window.innerHeight - topOffset;
                wrapper.style.height = `${availableHeight}px`;

                // Also set the height for the menu.
                var menuForm = document.getElementById("mark-read-aside");
                availableHeight -= menuForm.previousElementSibling.clientHeight;
                availableHeight -= document.getElementById("nav_entries").clientHeight;
                menuForm.style.height = `${availableHeight}px`;
            }

        };
        _resize();
        window.addEventListener("resize", _resize);

        var panel = document.getElementById("threepanesview");
        var panelContent = panel.querySelector(".flux");
        var setContent = function(html)
        {
            // Check the container has the expected height (which can sometimes be removed by
            //something else).
            if (!(wrapper.getAttribute("style") || "").includes("height"))
                _resize();

            panelContent.innerHTML = html;

            // Scroll to top of panel
            panel.scrollTop = 0;
        };

        var onArticleOpened = function(articleElement) {
            // Each skin might have a different background color for the content than the #global
            // node which is the parent they share with this extension container.
            // As  we want to keep the same display, we need to copy it.
            var contentStyles = window.getComputedStyle(articleElement);
            panelContent.style.backgroundColor = contentStyles.backgroundColor;
            panelContent.style.backgroundImage = contentStyles.backgroundImage;
            panelContent.style.color = contentStyles.color;

            setContent(articleElement.querySelector(".flux_content").innerHTML);

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
        };

        document.addEventListener('freshrss:openArticle', function(event) {
            onArticleOpened(event.target);
        });

        stream.addEventListener("click", function(event) {
            // Open external links in the 3rd pane too.
            if (event.target.matches(".flux li.link *") && !event.ctrlKey)
            {
                event.preventDefault();

                var html = "";
                var link = event.target.closest("a");
                var url = link ? link.getAttribute("href") : "";
                if (url) {
                    setContent(`<iframe src="${url}"></iframe>`);
                }

                return;
            }

            // Legacy: deal with older FreshRSS versions without 'openArticle' event.
            if (!window.freshrssOpenArticleEvent) {
                var closestArticle = event.target.closest(".flux");

                if (closestArticle && stream.contains(closestArticle))
                    onArticleOpened(closestArticle);
            }
        });
    };

    if (document.readyState === "loading") {
        window.addEventListener("load", _load);
    } else {
        _load();
    }
}());
