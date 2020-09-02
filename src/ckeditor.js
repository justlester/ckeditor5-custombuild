/**
 * @license Copyright (c) 2014-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat.js';
import Autolink from '@ckeditor/ckeditor5-link/src/autolink.js';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold.js';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import Heading from '@ckeditor/ckeditor5-heading/src/heading.js';
import Image from '@ckeditor/ckeditor5-image/src/image.js';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption.js';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize.js';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle.js';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar.js';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload.js';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic.js';
import Link from '@ckeditor/ckeditor5-link/src/link.js';
import List from '@ckeditor/ckeditor5-list/src/list.js';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed.js';
import MediaEmbedToolbar from '@ckeditor/ckeditor5-media-embed/src/mediaembedtoolbar.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice';
import RemoveFormat from '@ckeditor/ckeditor5-remove-format/src/removeformat.js';
import SimpleUploadAdapter from '@ckeditor/ckeditor5-upload/src/adapters/simpleuploadadapter.js';
import TextTransformation from '@ckeditor/ckeditor5-typing/src/texttransformation.js';
import TodoList from '@ckeditor/ckeditor5-list/src/todolist';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline.js';
import WordCount from '@ckeditor/ckeditor5-word-count/src/wordcount.js';

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import switchTextCaseIcon from '../icons/svgs/switchcase-icon.svg';
import lowerCaseIcon from '../icons/svgs/lowercase-icon.svg';
import upperCaseIcon from '../icons/svgs/uppercase-icon.svg';
import capitalizeIcon from '../icons/svgs/capitalize-icon.svg';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import Command from "@ckeditor/ckeditor5-core/src/command";
import { upperCase, lowerCase, capitalizeCase, toggleCase, getText } from "./utils";
const SwitchTextCaseButtons = [
	{
		label: 'Transform Text Switcher',
		icon: switchTextCaseIcon,
		mode: 'transformTextSwitcher'
	},
	{
		label: 'Transform Text to Lowercase',
		icon: lowerCaseIcon,
		mode: 'transformTextLowerCase'
	},
	{
		label: 'Transform Text to Uppercase',
		icon: upperCaseIcon,
		mode: 'transformTextUpperCase'
	},
	{
		label: 'Capitalize Text',
		icon: capitalizeIcon,
		mode: 'capitalizeText'
	}
];
class SwitchTextCase extends Plugin{
	init(){
		const editor = this.editor;
		editor.commands.add("SwitchTextCase", new SwitchTextCaseCommand(this.editor));
		SwitchTextCaseButtons.forEach(button=>{
			editor.ui.componentFactory.add(button.mode, locale => {
				const view = new ButtonView( locale );
				view.set( {
					label: button.label,
					icon: button.icon,
					tooltip: true
				} );
				view.on( 'execute', () => {
					editor.execute('SwitchTextCase',button.mode);
				} );
				return view;
			});
		});
	}
};
class SwitchTextCaseCommand extends Command{
	execute(mode){
		const startPos = this.editor.model.document.selection.getFirstPosition();
		const endPos = this.editor.model.document.selection.getLastPosition();
		this.editor.model.enqueueChange(writer=>{
			const range = writer.createRange(startPos, endPos);
			const sourceText = getText(range);
			let targetText;
			switch (mode) {
				case 'transformTextSwitcher':
				  targetText = toggleCase(sourceText);
				  break;
				case 'transformTextLowerCase':
				  targetText = lowerCase(sourceText);
				  break;
				case 'transformTextUpperCase':
				  targetText = upperCase(sourceText);
				  break;
				case 'capitalizeText':
				  targetText = capitalizeCase(sourceText);
				  break;
				default:
				  targetText = sourceText;
				  break;
			}
			//REPLACE TEXT
			this.editor.model.enqueueChange(writer => {
				const parent = range.start.parent;
				// Get the attributes of selected node before replacing the text
				const styles = Array.from(parent.getChildren()).map(a => {
				  return {
					attributes: Array.from(a.getAttributes()),
					range: writer.createRangeOn(a)
				  };
				});
				// Replace the text with new one
				let newText = writer.createText(targetText, {});
				this.editor.model.insertContent(newText, range);
				// Revert the text attributes into its original attributes
				styles.forEach(item => {
				  writer.setAttributes(item.attributes, item.range);
				});
				//Select the replaced text again
				this.editor.model.enqueueChange(writer=>{
					const range = writer.createRange( startPos, endPos );
					writer.setSelection( range );
				});
			});
		});
	}
};


class Editor extends ClassicEditor {}

// Plugins to include in the build.
Editor.builtinPlugins = [
	SwitchTextCase,
	Autoformat,
	Autolink,
	Bold,
	Essentials,
	Heading,
	Image,
	ImageCaption,
	ImageResize,
	ImageStyle,
	ImageToolbar,
	ImageUpload,
	Italic,
	Link,
	List,
	MediaEmbed,
	MediaEmbedToolbar,
	Paragraph,
	PasteFromOffice,
	RemoveFormat,
	SimpleUploadAdapter,
	TextTransformation,
	TodoList,
	Underline,
	WordCount
];

Editor.defaultConfig = {
	toolbar: {
		items: [
			'undo',
			'redo',
			'|',
			'heading',
			'|',
			'removeFormat',
			'bold',
			'italic',
			'underline',
			'link',
			'bulletedList',
			'|',
			'transformTextSwitcher',
			'transformTextLowerCase',
			'transformTextUpperCase',
			'capitalizeText',
			'|',
			'imageUpload',
			'mediaEmbed'
		],
	},
	language: 'en',
	image: {
		styles: ['alignLeft', 'alignCenter', 'alignRight'],
		resizeUnit: 'px',
		toolbar: [
			'imageStyle:alignLeft', 'imageStyle:alignCenter', 'imageStyle:alignRight',
			'|',
			'imageTextAlternative'
		],
		upload: {
			panel: {
				items: [ 'insertImageViaUrl' ]
			}
		}
	},
	link: {
		decorators: {
			openInNewTab: {
				mode: 'manual',
				label: 'Open in a new tab',
				defaultValue: true,	
				attributes: {
					target: '_blank'
				}
			}
		}
	},
	licenseKey: ''
};

export default Editor;
