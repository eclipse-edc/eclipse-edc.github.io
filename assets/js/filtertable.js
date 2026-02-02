(function () {
    function norm(s) {
        return (s || "").toLowerCase().trim();
    }

    function init($container) {
        var $input = $container.find(".ft-input");
        var $status = $container.find(".ft-status");
        var $table = $container.find("table").first();

        if (!$input.length || !$table.length) return;

        var $tbody = $table.find("tbody").first();
        if (!$tbody.length) return;

        var $rows = $tbody.find("tr");
        var total = $rows.length;

        // Find Title/Description columns by header text; fallback to first two columns
        var $ths = $table.find("thead th");
        var titleIdx = -1, descIdx = -1;

        $ths.each(function (i) {
            var t = norm($(this).text());
            if (t === "title") titleIdx = i;
            if (t === "description") descIdx = i;
        });

        if (titleIdx < 0) titleIdx = 0;
        if (descIdx < 0) descIdx = 1;

        // Precompute searchable text once
        var haystacks = [];
        $rows.each(function () {
            var $cells = $(this).children("td,th");
            var title = $cells.eq(titleIdx).text();
            var desc = $cells.eq(descIdx).text();
            haystacks.push((title + " " + desc).toLowerCase());
        });

        function setStatus(shown, q) {
            if (!$status.length) return;
            $status.text(q ? ("Showing " + shown + " of " + total + " rows") : ("Showing " + total + " rows"));
        }

        function apply() {
            var q = norm($input.val());
            var shown = 0;

            $rows.each(function (i) {
                var match = !q || haystacks[i].indexOf(q) !== -1;
                // Use toggling display rather than hidden attribute for widest compatibility
                $(this).toggle(match);
                if (match) shown++;
            });

            setStatus(shown, q);
        }

        $input.on("input", apply);
        apply();
    }

    function boot() {
        var $ = window.jQuery;
        if (!$) return; // jQuery not present

        $("[data-ft]").each(function () {
            init($(this));
        });
    }

    // Ensure jQuery + DOM ready
    if (window.jQuery) {
        window.jQuery(boot);
    } else {
        document.addEventListener("DOMContentLoaded", boot);
    }
})();
