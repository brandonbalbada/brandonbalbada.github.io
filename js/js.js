
window.addEventListener('load', function () {
    var main = new Vue({
        el: '#main',
        data: {
          isNotClicked: true,
          shrink: false,
          isAtBottom: false
        },
        created() {
            window.addEventListener("scroll", this.scrollMe);
        },
        beforeDestroy() {
            // window.removeEventListener("scroll", this.scrollMe);
        },
        methods: {
            clickMe: function(){
                window.scrollTo(0,0);
                
                setTimeout(() => {
                    this.isNotClicked = false;
                    this.shrink = true;
                    this.isAtBottom = false;
                }
              , 500);
            },
            scrollMe: function(){
                
                this.isAtBottom = document.querySelector("#projects").getBoundingClientRect().bottom <= window.innerHeight ? true : false;
              
            }
        },
      });
})