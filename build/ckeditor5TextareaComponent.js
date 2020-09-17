Vue.component('ckeditor5-textarea',{
    template: /*html*/`
        <v-input
            class="cke5txtarea-v-input mb-2"
            :value="editorData"
            :required="required"
            :rules="rules"
            :disabled="disabled">
            <div style="width:100%">
                <div class="body-2 pa-1 d-flex align-center" v-if="label">{{label}}</div>
                <div class="cke5txtarea-border">
                    <textarea ref="texteditorTarget"></textarea>
                </div>
            </div>
        </v-input>
    `,
    created() {
        var css = /*css*/`
            .cke5txtarea-v-input.error--text  .cke5txtarea-border{
                border: 3px solid;
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
    props: {
        value: String,
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
            editorInstance: null,   
            lastEditorData: '',
            delayBeforeEmitInput: null,         
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
    },
    mounted() {
        this.initTextEditor();
    },
    watch: {
        editorData(newVal,oldVal){
            newVal !== oldVal && newVal !== this.lastEditorData && this.editorInstance.setData(newVal);
        }
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
                        console.log('CKEDITOR TEXTAREA CREATED');
                        that.editorInstance = editor;
                        that.initDataChange();
                        return editor;
                    });
            });
            watchdog.setDestructor( editor => {return editor.destroy();});
            watchdog.on( 'error', that.handleTextEditorError );
            watchdog.create(elementToConvert,that.config).catch(that.handleTextEditorError);
        },
        handleTextEditorError(error){
            console.error('CKEDITOR 5 TEXTAREA ERROR:',error);
        },
        initDataChange(){
            this.editorInstance.model.document.on( 'change:data', (e) => {
                clearTimeout(this.delayBeforeEmitInput);
                this.delayBeforeEmitInput = setTimeout(()=>{
                    var currentData = this.editorInstance.getData();
                    const n = this.lastEditorData = currentData;
                    this.$emit("input", n, e, this.editorInstance);
                },700);
            }, 300, {
                leading: !0
            });
        },
    },
});