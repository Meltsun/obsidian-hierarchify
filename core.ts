import {MarkdownView} from "obsidian";
import {MarkdownRefactoringHandle,HeadingDepth} from "MarkdownRefactoringHandle"
export type { HeadingDepth };

//设置项
export interface MySettings{
    testSetting1:string;
    listIndexHandleMethod:string;
    addHeadingIndexFrom:HeadingDepth|7;
}

const MY_DEFAULT_SETTING: MySettings = {
    testSetting1: 'test default setting',
    listIndexHandleMethod:'Increase from 1' as 'Increase from 1'|'Increase from Any',
    addHeadingIndexFrom:1
}

export class CoreHandle{
    private settings:MySettings
    public set_settings(newSettings:Partial<MySettings>){
        this.settings=Object.assign({},MY_DEFAULT_SETTING,this.settings,newSettings)
    }

    public get_settings(){
        return this.settings
    }

    //将一个笔记的序号格式化
    public format_index_for_a_note(markdownView:MarkdownView){
        const editor = markdownView.editor;
        const cursor = editor.getCursor();
        let text = editor.getValue();
        const handle=new MarkdownRefactoringHandle(text)
        text = handle
                .format_index({
                    addHeadingIndexFrom:this.settings.addHeadingIndexFrom,
                    listIndexHandleMethod:this.settings.listIndexHandleMethod
                })
                .stringify()
        //format_index(lines,{addTitleIndexFrom:settings.titleIndex, listIndexHandleMethod:settings.listIndex});
        editor.setValue(text);
        editor.setCursor(cursor);
        console.log("reflactor:序号格式化")
    }

    //将一个标题转为列表
    public heading_to_list(markdownView:MarkdownView,line:number,modifyPeerHeadings:boolean){
        const editor = markdownView.editor;
        const cursor = editor.getCursor();
        let text = editor.getValue();
        const handle=new MarkdownRefactoringHandle(text)
        text = handle
                .heading_to_list_by_line(line+1,modifyPeerHeadings)
                .format_index({
                    addHeadingIndexFrom:this.settings.addHeadingIndexFrom,
                    listIndexHandleMethod:this.settings.listIndexHandleMethod
                })
                .stringify()
        editor.setValue(text);
        editor.setCursor(cursor);
        console.log("reflactor:标题转列表")
    }

    //将一个列表转为标题
    public list_to_heading(markdownView:MarkdownView,line:number){
        const editor = markdownView.editor;
        const cursor = editor.getCursor();
        let text = editor.getValue();
        const handle=new MarkdownRefactoringHandle(text)
        text = handle
                .list_to_heading_by_line(line+1)
                .format_index({
                    addHeadingIndexFrom:this.settings.addHeadingIndexFrom,
                    listIndexHandleMethod:this.settings.listIndexHandleMethod
                })
                .stringify()
        editor.setValue(text);
        editor.setCursor(cursor);
        console.log("reflactor:列表转标题")
    }

}