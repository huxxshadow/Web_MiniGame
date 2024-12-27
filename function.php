

function enqueue_game_scripts() {
    // 引入 Matter.js 库
    wp_enqueue_script('matter-js', 'https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.20.0/matter.js', array(), null, true);
    wp_enqueue_script('pixi-js', 'https://cdnjs.cloudflare.com/ajax/libs/pixi.js/8.5.1/pixi.min.js', array(), null, true);
    if ( is_page('home') ) {
    // 这段代码只会在 slug 为 'about-me' 的页面加载
    // 引入自定义的 gravity-game.js
    
    
    wp_enqueue_script('gravity-game', get_template_directory_uri() . '/js/gravity-game.js', array('matter-js','pixi-js'), null, true);
    // 引入自定义的 tub-game.js
    wp_enqueue_script('tub-game', get_template_directory_uri() . '/js/tub-game.js', array('matter-js','pixi-js'), null, true);
    }

    if ( is_page('about-me') ) {
        wp_enqueue_script('cloth-game', get_template_directory_uri() . '/js/cloth-game.js', array('matter-js'), null, true);
    }
    

}
add_action('wp_enqueue_scripts', 'enqueue_game_scripts');


// 将总访问人数传递给 JavaScript
function pass_total_visits_to_js() {

    if (is_page('portfolio')){
    // 使用 'wp_enqueue_scripts' 钩子来加载脚本
    wp_enqueue_script('custom-js', get_template_directory_uri() . '/js/custom.js', array(), null, true);

    
    // 将访问总数传递给 JavaScript
    wp_localize_script('custom-js', 'visitData', array(
        'totalVisits' => wp_statistics_visitor('total')
    ));
    }
}
add_action('wp_enqueue_scripts', 'pass_total_visits_to_js');


