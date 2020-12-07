Vue.component('ckeditor5-texteditor',{
    template: /*html*/`
        <v-input
            class="cke5txteditor-v-input"
            :value="value"
            :required="required"
            :rules="rules"
            :disabled="disabled"
            :hide-details="false"
            hint="true"
            persistent-hint
            @update:error="(ev)=>isRulesNotMeet=ev">
            <div style="width:100%;">
                <v-row no-gutters>
                    <v-col class="pa-0 text--primary font-weight-bold body-1" v-text="label">
                    </v-col>
                    <v-col cols="auto" class="d-flex justify-end">
                        <v-menu offset-y max-height="500px">
                            <template v-slot:activator="{on,attrs}">
                                <v-btn v-on="on" v-bind="attrs" color="primary" class="font-weight-bold" small text>
                                    View Shortcut Keys
                                </v-btn>
                            </template>
                            <v-card>
                                <v-simple-table class="body-2" dense><template v-slot:default>
                                    <thead><tr><th class="text-left">Action</th><th class="text-left">Keys</th></tr></thead>
                                    <tbody><tr v-for="item in shortcutKeys" :key="shortcutKeys.action"><td>{{ item.action }}</td><td>
                                    <div v-for="(cm,i) in item.commands" :key="i">{{cm}}</div></td></tr></tbody>
                                </template></v-simple-table>
                            </v-card>
                        </v-menu>
                    </v-col>
                </v-row>
                </v-card-text>
                <div class="cke5txteditor-border">
                    <ckeditor :editor="editorBuild" v-model="innerEditorValue" @ready="onEditorReady" @input="onEditorChange"></ckeditor>
                </div>
            </div>
            <template v-slot:message="{message}">
                <v-row no-gutters>
                    <v-col class="px-1 pb-1">{{isRulesNotMeet ? message : ''}}</v-col>
                    <v-col class="px-1 pb-1 body-2 text--primary" v-if="hasCounters" cols="auto">
                        <span v-if="showParagraphCount" class="mx-1">
                            Paragraphs: {{paragraphCount}}
                        </span> 
                        <span v-if="showSentenceCount" class="mx-1">
                            Sentences: {{sentenceCount}}
                        </span>
                        <span v-if="showWordCount" class="mx-1">
                            Words: {{wordCount}}
                        </span>
                        <span v-if="showCharCount" class="mx-1">
                            Characters: {{characterCount}}
                        </span>
                    </v-col>
                </v-row>
            </template>
        </v-input>
    `,
    components: {
        ckeditor: CKSource.CKEditor.component
    },
    props: {
        value: {
            type: String,
            default: ''
        },
        label: {
            type: String,
            default: null,
        },
        required: {
            type: Boolean,
            default: false,
        },
        rules: {
            type: Array,
            default: () => ([])
        },
        disabled: {
            type: Boolean,
            default: false
        },
        showParagraphCount: {
            type: Boolean,
            default: false,
        },
        showSentenceCount: {
            type: Boolean,
            default: false,
        },
        showWordCount: {
            type: Boolean,
            default: false,
        },
        showCharCount: {
            type: Boolean,
            default: false,
        },
        verifyUrlLinks: {
            type: Boolean,
            default: false,
        },
        proxyServerUrl: {
            type: String,
            default: ''
        }   
    },
    data() {
        return {
            editorBuild: CKSource.Editor,
            isRulesNotMeet: false,
            characterCount: 0,
            lastValue: '',
            innerEditorValue: '',
            editorStyles: '',
            foundLinks: [],
        }
    },
    computed: {
        hasCounters(){
            return this.showParagraphCount || this.showSentenceCount || this.showWordCount || this.showCharCount;
        },
        paragraphCount(){
            var text = this.value;
            var count = 0;
            if(text){
                var div = document.createElement("div");
                div.innerHTML = text;
                var parag = div.getElementsByTagName("p");
                count = 0;
                Array.from(parag).forEach((p,i)=>{
                    if(p.innerText.trim()){
                        count += 1;
                    }
                });
                div.remove();
            }
            this.$emit('count-paragraph',count);
            return count;
        },
        sentenceCount(){
            var text = this.value;
            var count = 0;
            if(text){
                var div = document.createElement("div");
                div.innerHTML = text;
                var cleanText = div.textContent || div.innerText || "";
                var sentencesArray = cleanText.match(/[\w|\)][.?!](\s|$)/g);
                count = sentencesArray ? sentencesArray.length : 0;
                div.remove();
            }
            this.$emit('count-sentence',count);
            return count;
        },
        wordCount(){
            var text = this.value;
            var count = 0;
            if(text){
                var detectedWords=[], div = document.createElement('div'), div2 = document.createElement('div');
                var wordMatchRegex = /'?\w[\w']*(?:-\w+)*'?/g;
                var matchHTMLRegex = /<[^>]*>/g;
                div.innerHTML = text;
                Array.from(div.children).forEach(tag=>{
                    div2.innerHTML = tag.innerHTML.replace(matchHTMLRegex," ");
                    var foundWords = (div2.innerText || '').trim().split(/\s+/).map(x=>x.trim())
                    .filter(x=>{
                        var match = (x || '').match(wordMatchRegex);
                        var check = x && (match || '').length > 0;
                        return check
                    });
                    detectedWords = [...detectedWords, ...foundWords];
                });
                div.remove();
                div2.remove();
                count = detectedWords.length;
            } 
            this.$emit('count-word',count);
            return count;
        },
        ctrlKey(){
            return navigator.platform.match("Mac") ? '&#8984;':'Ctrl';
        },
        shortcutKeys(){
            return [
                {
                    action: 'Copy',
                    commands: [`${this.ctrlKey} + C`]
                },
                {
                    action: 'Paste',
                    commands: [`${this.ctrlKey} + V`]
                },
                {
                    action: 'Undo',
                    commands: [`${this.ctrlKey} + Z`]
                },
                {
                    action: 'Redo',
                    commands: [`${this.ctrlKey} + Y`,`${this.ctrlKey} + Shift + Y`]
                },
                {
                    action: 'Bold',
                    commands: [`${this.ctrlKey} + B`]
                },
                {
                    action: 'Italic',
                    commands: [`${this.ctrlKey} + I`]
                },
                {
                    action: 'Underline',
                    commands: [`${this.ctrlKey} + U`]
                },
                {
                    action: 'Link',
                    commands: [`${this.ctrlKey} + K`]
                },
            ];
        },
    },
    created() {
        var css = /*css*/`
            .cke5txteditor-v-input.error--text  .cke5txteditor-border{
                border: 3px solid;
            }
            .cke5txteditor-v-input.error--text .ck.ck-content{
                color: rgb(0, 0, 0);
                caret-color: rgb(0, 0, 0);
            }
            .cke5txteditor-v-input .ck-editor__editable_inline{
                min-height: 100px;
            }
            .cke5txteditor-v-input .ck.ck-sticky-panel .ck-sticky-panel__content_sticky {
                position: static !important;
                bottom: 0 !important;
                width:100% !important;
            }
            .cke5txteditor-v-input .ck.ck-content{
                padding-top: 10px;
                padding-bottom: 10px;
            } 
        `;
        style = document.getElementById('ckeditor5-texteditor-component-styles') || document.createElement('style'),
        head = document.head || document.getElementsByTagName('head')[0];
        head.appendChild(style);
        style.type = 'text/css';
        style.setAttribute('id','ckeditor5-texteditor-component-styles');
        if(style.styleSheet){
            style.styleSheet.cssText = css;
        }else {
            style.appendChild(document.createTextNode(css));
        }
    },
    mounted() {
        var stylesObj = Array.from(document.getElementsByTagName('style')).find(x=>x.hasAttribute("data-cke"));
        this.editorStyles = CKSource.EditorUtils.postcss([CKSource.EditorUtils.cssvariables()]).process((stylesObj ? stylesObj.innerHTML : '')).css;
    },
    watch: {
        value(newVal,oldVal){
            if(newVal !== oldVal && newVal !== this.lastValue){
                this.innerEditorValue = newVal;
            }
            var newLinks = this.getHrefLinksInText(newVal);
            if(this.verifyUrlLinks){
                this.verifyFoundLinks(newLinks);
            }else {
                this.foundLinks = newLinks;
            }
        },
        characterCount(newVal){
            this.$emit('count-char',newVal);
        },
        foundLinks:{
            deep: true,
            handler(value){
                value.forEach(item=>{
                    delete item.requestVerify;
                });
                this.$emit('get-links',value);
            }
        },
    },
    methods: {
        onEditorReady(editor){
            var that = this;
            var wordCountPlugin = editor.plugins.get( 'WordCount' );
            this.characterCount = wordCountPlugin.characters;
            wordCountPlugin.on( 'update', ( evt, stats ) => {
                that.characterCount = stats.characters;
            });
        },
        onEditorChange(value){
            var htmlWithInlineStyles = CKSource.EditorUtils.juice.inlineContent(`<div class="ck-content">${value}</div>`,this.editorStyles);
            var div = document.createElement('div'); 
            div.innerHTML = htmlWithInlineStyles;
            var currentData = div.firstChild ? div.firstChild.innerHTML : '';
            var d = this.lastValue = currentData;
            this.$emit('input',d);
        },
        getHrefLinksInText(text){
            if(text){
                var that = this;
                var snippet = document.createElement("div");
                snippet.innerHTML = text;
                var links = snippet.getElementsByTagName("a");
                var tempArray = Array.from(links).map((x,i)=>{
                    var linkObj = {
                        order: i,
                        href: x.href,
                        text: x.innerText,
                        wordCount: that.getWordCountCustom(x.innerText),
                    };
                    if(this.verifyUrlLinks){
                        linkObj.isVerifying = true;
                        linkObj.isExists = null;
                        linkObj.requestVerify = null;
                    };
                    return linkObj;
                });
                snippet.remove();
                return tempArray;
            }else return [];
        },
        verifyFoundLinks(newLinks){
            var that = this;
            //abort recent verifications
            this.foundLinks.forEach(item=>{
                if(item.isVerifying && item.requestVerify){
                    item.requestVerify.abort();
                }
            });
            //retrieve verified links
            newLinks.forEach(item=>{
                var matched = this.foundLinks.filter(x=>x.order==item.order&&x.href==item.href);
                if(matched.length){
                    item.isVerifying = matched[0].isVerifying;
                    item.isExists = matched[0].isExists;
                    item.requestVerify = null;
                }
            });
            //set found links for status display
            this.foundLinks = newLinks;
            //verify link
            clearTimeout(this.delayBeforeVerifyLinks);
            this.delayBeforeVerifyLinks = setTimeout(()=>{
                this.foundLinks.forEach((item,index)=>{
                    if(!item.isExists){
                        item.requestVerify = that.checkUrlExists(item.href,function(result){
                            var newObj = item;
                            newObj.isExists = result;
                            newObj.isVerifying = false;
                            Vue.set(that.foundLinks, index, newObj);
                        });
                    }
                });
            },700);
        },
        checkUrlExists(url,callback){
            var that = this;
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() { 
                if (xhr.readyState === 4) {
                    var returnValue = 
                        (xhr.status == 200) ? true : (xhr.status == 404) ? false : null;
                    callback(returnValue);
                }
            }
            xhr.open("HEAD",that.proxyServerUrl+url, true); 
            xhr.send(null);
            return xhr;
        },
        revalidateLinks(){
            this.foundLinks.forEach(item=>{
                item.isVerifying = true;
                item.isExists = null;
                item.requestVerify = null;
            });
            this.verifyFoundLinks(this.foundLinks);
        }, 
        getWordCountCustom(text){
            if(text){
                text = text.replace(/<[^>]*>/g, " ");
                text = text.replace(/\s+/g, ' ');
                text = text.trim();
                return text.split(" ").length
            } else return 0;
        },
    },

});