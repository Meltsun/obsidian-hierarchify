//命令和其他交互接口的回调函数
import {MarkdownView} from "obsidian";
import {format_index} from "indexFormatter"

//设置项
export interface MySetting{
    testSetting1:string;
    listIndex:string;
    titleIndex:number;
}

//将一个笔记的序号格式化
export function format_index_for_a_note(markdownView:MarkdownView,settings:MySetting){
    const editor = markdownView.editor;
    const cursor = editor.getCursor();
    const lines = editor.getValue().split("\n");
    format_index(lines,{addTitleIndexFrom:settings.titleIndex, listIndexHandleMethod:settings.listIndex});
    editor.setValue(lines.join("\n"));
    editor.setCursor(cursor);
    console.log("reflactor:已修改")
}

