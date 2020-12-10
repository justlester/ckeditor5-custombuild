Vue.component('ckeditor5-textarea',{
    template: /*html*/`
        <v-input
            class="cke5txtarea-v-input mb-2"
            :value="value"
            :required="required"
            :rules="rules"
            :disabled="disabled">
            <div style="width:100%">
                <div class="body-2 pa-1 d-flex align-center" v-if="label">{{label}}</div>
                <div class="cke5txtarea-border">
                    <ckeditor :editor="editorBuild" :config="config" v-model="innerEditorValue" @ready="onEditorReady" @input="onEditorChange"></ckeditor>
                </div>
            </div>
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
        disabled: {
            type: Boolean,
            default: false
        },
        required: {
            type: Boolean,
            default: false,
        },
        rules: {
            type: Array,
            default: () => ([])
        },
        config: {
            type: Object,
            default: ()=>({
                toolbar: {
                    items: [
                        'undo',
                        'redo',
                        '|',
                        'removeFormat',
                        'bold',
                        'italic',
                        'underline',
                        'link',
                        'numberedList',
                        'bulletedList',
                        '|',
                        'transformTextSwitcher',
                        'transformTextLowerCase',
                        'transformTextUpperCase',
                        'capitalizeText',
                    ],
                },
            })
        }
    },
    data(){
        return {
            editorBuild: CKSource.Editor,
            lastValue: '',
            innerEditorValue: '', 
            editorStyles: '',      
        }
    },  
    created() {
        var css = /*css*/`
            .cke5txtarea-v-input.error--text .cke5txtarea-border{
                border: 3px solid;
            }
            .cke5txtarea-v-input.error--text .ck.ck-content{
                color: rgb(0, 0, 0);
                caret-color: rgb(0, 0, 0);
            }
            .cke5txtarea-v-input .ck-editor__editable_inline{
                min-height: 100px;
            }
            .cke5txtarea-v-input .ck.ck-sticky-panel .ck-sticky-panel__content_sticky {
                position: static !important;
                bottom: 0 !important;
                width:100% !important;
            }
            .cke5txtarea-v-input .ck.ck-content{
                padding-top: 10px;
                padding-bottom: 10px;
            } 
        `;
        style = document.getElementById('ckeditor5-textarea-component-styles') || document.createElement('style'),
        head = document.head || document.getElementsByTagName('head')[0];
        head.appendChild(style);
        style.type = 'text/css';
        style.setAttribute('id','ckeditor5-textarea-component-styles');
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
                this.innerEditorValue = (newVal || '');
            }
        }
    },
    methods: {
        onEditorReady(editor){
            this.innerEditorValue = this.value || '';
            this.$emit('ready',editor);
        },
        onEditorChange(value){
            var htmlWithInlineStyles = CKSource.EditorUtils.juice.inlineContent(`<div class="ck-content">${value}</div>`,this.editorStyles);
            var div = document.createElement('div'); 
            div.innerHTML = htmlWithInlineStyles;
            var currentData = div.firstChild ? div.firstChild.innerHTML : '';
            var d = this.lastValue = currentData;
            this.$emit('input',d);
        },
    },
});