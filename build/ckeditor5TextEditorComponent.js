Vue.component('ckeditor5-texteditor',{
    template: /*html*/`
        <v-input 
            class="cke5txteditor-v-input"
            :value="editorData"
            :required="required"
            :rules="rules"
            :disabled="disabled">
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
                                <v-simple-table class="body-2" dense>
                                <template v-slot:default>
                                  <thead>
                                    <tr>
                                      <th class="text-left">Action</th>
                                      <th class="text-left">Keys</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr v-for="item in shortcutKeys" :key="shortcutKeys.action">
                                      <td>{{ item.action }}</td>
                                      <td>
                                        <div v-for="(cm,i) in item.commands" :key="i">
                                            {{cm}}
                                        </div>
                                      </td>
                                    </tr>
                                  </tbody>
                                </template>
                              </v-simple-table>
                            </v-card>
                        </v-menu>
                    </v-col>
                </v-row>
                </v-card-text>
                <div class="cke5txteditor-border">
                    <textarea ref="texteditorTarget"></textarea>
                </div>
                <div v-if="showParagraphCount || showSentenceCount || showWordCount || showCharCount" class="d-flex justify-end body-2 pa-1 pa-2">
                    <div v-if="showParagraphCount" class="mx-1">
                        Paragraph: {{paragraphCount}}
                    </div> 
                    <div v-if="showSentenceCount" class="mx-1">
                        Sentences: {{sentenceCount}}
                    </div>
                    <div v-if="showWordCount" class="mx-1">
                        Words: {{wordCount}}
                    </div>
                    <div v-if="showCharCount" class="mx-1">
                        Characters: {{characterCount}}
                    </div>
                </div>
            </div>
        </v-input>
    `,
    created() {
        var css = `
            .cke5txteditor-v-input.error--text  .cke5txteditor-border{
                border: 2px solid;
            }
            .cke5txteditor-v-input .ck-editor__editable_inline{
                min-height: 100px;
            }
            .cke5txteditor-v-input .ck.ck-editor__top.ck-reset_all {
                position: static !important;
            }  
            .ck.ck-sticky-panel__placeholder {
                display : none !important;
            } 
            .ck.ck-sticky-panel .ck-sticky-panel__content_sticky {
                position: unset !important;
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
    props: {
        value: String,
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
            default: []
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
        }   
    },
    data(){
        return {
            editorInstance: null,
            lastEditorData: '',
            characterCount: 0,
            wordCount: 0,

            delayBeforeEmit: null,
        }
    },  
    computed: {
        editorData: {
            get: function(){
                return this.value ? this.value : '';
            },
            set:function(value){
                this.$emit('input',value);
            }
        },
        paragraphCount(){
            var text = this.editorData;
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
            var text = this.editorData;
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
        isPlatformMac(){
            return navigator.platform.match("Mac");
        },
        ctrlKey(){
            return this.isPlatformMac ? '&#8984;':'Ctrl';
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
        }
    },
    mounted() {
        this.initTextEditor();
    },
    watch: {
        editorData(newVal,oldVal){
            newVal !== oldVal && newVal !== this.lastEditorData && this.editorInstance.setData(newVal);
            // this.findLinks(this.editorData);
        },
    },
    methods: {
        initTextEditor(){
            var elementToConvert = this.$refs.texteditorTarget;
            var that = this;
            const watchdog = new CKSource.Watchdog();
            watchdog.setCreator( ( element, config ) => {
                return CKSource.Editor
                    .create( element, config )
                    .then( editor => {
                        console.log('EDITOR CREATED');
                        that.editorInstance = editor;
                        that.initWordCount();
                        that.initDataChange();
                        return editor;
                    });
            });
            watchdog.setDestructor( editor => {return editor.destroy();});
            watchdog.on( 'error', that.handleTextEditorError );
            watchdog.create(elementToConvert).catch(that.handleTextEditorError);
        },
        handleTextEditorError(error){
            console.error('CKEDITOR 5 ERROR:',error );
        },
        initWordCount(){
            var that = this;
            var editor = that.editorInstance;
            var wordCountPlugin = editor.plugins.get( 'WordCount' );
            this.characterCount = wordCountPlugin.characters;
            this.wordCount = wordCountPlugin.words;
            this.$emit('count-char',this.characterCount);
            this.$emit('count-word',this.wordCount);
            wordCountPlugin.on( 'update', ( evt, stats ) => {
                that.characterCount = stats.characters;
                that.wordCount = stats.words;
                this.$emit('count-char',that.characterCount);
                this.$emit('count-word',that.wordCount);
            });
        },
        initDataChange(){
            this.editorInstance.model.document.on( 'change:data', (e) => {
                clearTimeout(this.delayBeforeEmit);
                this.delayBeforeEmit = setTimeout(()=>{
                    var currentData = this.editorInstance.getData();
                    var div = document.createElement('div');
                    div.innerHTML = currentData;
                    Array.from(div.getElementsByTagName('figure')).forEach(async figure=>{
                        if(figure.classList.contains('image-style-align-left')){
                            figure.style.float = 'left';
                            figure.style.margin = '1em 24px 1em 0px';
                        }else if(figure.classList.contains('image-style-align-center')){
                            figure.style.margin = '1em auto';
                        }else if(figure.classList.contains('image-style-align-right')){
                            figure.style.float = 'right';
                            figure.style.margin = '1em 0px 1em 24px';
                        }
                        var image = figure.getElementsByTagName('img');
                        if(image.length){
                            if(!figure.style.width){
                                var imageDim = await this.getImageDimensions(image[0].src);
                                figure.style.width = imageDim.width;
                            }
                            image[0].style.width = '100%';
                        }
                        var captions = figure.getElementsByTagName('figcaption');
                        Array.from(captions).forEach(cap=>{
                           cap.style.textAlign = 'center';
                           cap.style.fontSize = '.75rem';
                        });
                    });
                    currentData = div.innerHTML;
                    div.remove();  
                    const n = this.lastEditorData = currentData;
                    this.$emit("input", n, e, this.editorInstance);
                },700);
            }, 300, {
                leading: !0
            });
        },
        getImageDimensions(url){
            return new Promise((resolve,reject)=>{
                var img = new Image();
                try {
                    if(url){
                        img.onload = function(){
                            resolve({
                                width: this.width,
                                height: this.height
                            });
                        }
                        img.src = url;
                    }else {
                        resolve(null);
                    }
                } catch (err) {
                    reject(err);
                } finally{
                    img.remove();
                }
            });
        },
    },
});