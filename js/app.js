'use strict';

$(function() {

    var $infoTpl = $('#info-template'),
        $listTpl = $('#list-template'),
        $info = $('#info'),
        $list = $('#list'),

        user = 'wenzhixin',
        stat = {},
        repos = [];

    function main() {
        initEvents();
        getRepos();
    }

    function initEvents() {
        $(document).on('submit', '#form', function() {
            location.href = location.origin + location.pathname + '?' + $('#username').val();
            return false;
        });
        $(document).on('click', '[data-type]', function() {
            filterRepos($(this).data('type'));
        });
    }

    function getRepos() {
        var params = {
                type: 'owner', // all, owner, member
                sort: 'full_name', // created, updated, pushed, full_name
                direction: 'asc', // asc, desc.
                per_page: 100, // up to 100
                page: 1 // start at page 1
            };

        user = location.search.substring(1) || user;
        $.ajax({
            url: 'https://api.github.com/users/' + user + '/repos?' + $.param(params),
            type: 'GET',
            dataType: 'jsonp',
            success: function(res) {
                if (!$.isArray(res.data) && res.data.hasOwnProperty('message')) {
                    $list.html(res.data.message);
                    return;
                }
                repos = res.data;
                resetRepos();
                showInfo(stat);
                showList(repos);
            },
            error: function(res) {
                $list.html('error:' + res);
            }
        });
    }

    function resetRepos() {
        repos = repos.sort(function(a, b) {
            if (a.stargazers_count < b.stargazers_count) {
                return 1;
            }
            if (a.stargazers_count > b.stargazers_count) {
                return -1;
            }
            if (a.forks_count < b.forks_count) {
                return 1;
            }
            if (a.forks_count > b.forks_count) {
                return -1;
            }
            if (a.id < b.id) {
                return 1;
            }
            if (a.id > b.id) {
                return -1;
            }
            return 0;
        });

        stat = {
            all: repos.length,
            sources: 0,
            forks: 0,
            total_stars: 0,
            total_forks: 0
        };
        $.map(repos, function(repo, i) {
            repo.fork ? stat.forks++ : stat.sources++;
            stat.total_stars += repo.stargazers_count;
            stat.total_forks += repo.forks_count;
        });
    }

    function filterRepos(type) {
        var list = [];

        $.each(repos, function(i, repo) {
            if (type === 'source' && repo.fork || type === 'fork' && !repo.fork) {
                return;
            }
            list.push(repo);
        });
        showList(list);
    }

    function showInfo(stat) {
        $info.html(Handlebars.compile($infoTpl.html())({
            user: user,
            stat: stat
        }));
    }

    function showList(repos) {
        $list.html(Handlebars.compile($listTpl.html())({
            repos: repos
        }));
        $('.ellipsis').ellipsis({row: 2});
    }

    main();
});