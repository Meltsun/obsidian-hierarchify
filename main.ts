//添加交互接口，调用core
import { Plugin, MarkdownView,App,PluginSettingTab,Setting,Menu} from "obsidian";
//import { MarkdownIndex } from "./indexFormatter_old";
import {MySetting ,format_index_for_a_note , HeadingDepth,heading_to_list} from "./core";

const MY_DEFAULT_SETTING: MySetting = {
    testSetting1: 'test default setting',
    listIndexHandleMethod:'Increase from 1' as 'Increase from 1'|'Increase from Any',
    addHeadingIndexFrom:1
}

export default class myPlugin extends Plugin {
    settings:MySetting

    //加载设置和缺省项
    async loadSettings() {
        this.settings = Object.assign({}, MY_DEFAULT_SETTING, await this.loadData());
    }

    //保存设置和缺省项
    async saveSettings() {
        await this.saveData(this.settings);
    }

    //启动时加载
    async onload() {
        await this.loadSettings();
        //设置里，添加标签页
        this.addSettingTab(new MySettingTab(this.app, this));

        //最左侧那一条菜单，添加图标
        this.addRibbonIcon('dice', 'Format this note', (evt: MouseEvent) => {
            const markdownView =this.app.workspace.getActiveViewOfType(MarkdownView);
            if(markdownView){
                format_index_for_a_note(markdownView,this.settings);
            }
        });

        //添加命令
        this.addCommand({
            id: "obsidian-index-formatting-format_this_note",
            name: "Format this note",
            checkCallback: (checking: boolean) => {
                const markdownView =this.app.workspace.getActiveViewOfType(MarkdownView);
                if (!markdownView) {
                    return false;
                }
                else{
                    if (!checking) {
                        format_index_for_a_note(markdownView,this.settings);
                    }
                    return true;
                }
            },
        });

        //编辑栏右键菜单
        this.registerEvent(
            this.app.workspace.on("editor-menu", (menu, editor, view) => {
                const cursor = editor.getCursor();
                const line = editor.getLine(cursor.line)
                const markdownView =this.app.workspace.getActiveViewOfType(MarkdownView);
                if(line==null || !/^#+ .*/.test(line) || !markdownView){
                    return;
                }
                console.log("在标题点击右键菜单：%d",cursor.line)
                const match = line.match(/^#+/)
                const depth = match?match[0].length:0;
                if(/^#+ .*/.test(editor.getLine(cursor.line))){
                    menu
                        .addSeparator()
                        .addItem((item) => {
                            item
                                .setTitle("将此标题重构为...")
                                .setIcon("document")
                                .onClick((event) => {
                                    if((event as MouseEvent).x && (event as MouseEvent).y){
                                        const mouseEvent = event as MouseEvent;
                                        //调整标题级别菜单
                                        const headingModifyMenu = new Menu();
                                        headingModifyMenu.addItem((item)=>{
                                            item
                                                .setTitle("取消")
                                        })
                                        headingModifyMenu.addSeparator()
                                        for(let i=1;i<=6;i++){
                                            if(i==depth){
                                                headingModifyMenu.addItem((item)=>{
                                                    item
                                                        .setTitle(`H${i} (now)`)
                                                })
                                            }
                                            else{
                                                headingModifyMenu.addItem((item)=>{
                                                    item
                                                        .setTitle(`H${i}`)
                                            })
                                            }
                                        }
                                        headingModifyMenu.addSeparator()
                                        headingModifyMenu.addItem((item)=>{
                                            item
                                                .setTitle(`List`)
                                                .setIcon('list')
                                                .onClick(()=>{
                                                    heading_to_list(markdownView,cursor.line,false)
                                                })
                                        })
                                        headingModifyMenu.showAtPosition({ x: mouseEvent.x-15, y: mouseEvent.y-20})
                                    }
                                });
                        });
                }
            })
        );
    }

    
}

//添加设置tab
class MySettingTab extends PluginSettingTab {
    plugin: myPlugin;
    constructor(app: App, plugin: myPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }
    display(): void {
        //获取标签页对应的容器
        const {containerEl} = this;
        containerEl.empty();

        //添加设置项
        new Setting(containerEl)
            .setName('name')
            .setDesc('desc')
            //.setTooltip('tooltip')
            .addText(text => text
                .setPlaceholder('place holder')
                .setValue(this.plugin.settings.testSetting1)
                .onChange(async (value) => {
                    console.log('Secret: ' + value);
                    this.plugin.settings.testSetting1 = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Format Ordered List Index')
            .addDropdown(Dropdown => Dropdown
                .addOptions({
                    'Increase from 1':'Increase from 1',
                    'Increase from any':'Increase from any',
                })
                .setValue(this.plugin.settings.listIndexHandleMethod)
                .onChange(async (value) => {
                    this.plugin.settings.listIndexHandleMethod = value;                    
                    await this.plugin.saveSettings();
                })
            )
                    
        new Setting(containerEl)
            .setName('Add index to titles ')
            .addDropdown(Dropdown => Dropdown
                .addOptions({
                    7:'Disabled',
                    1:'All Levels',
                    2:'Level 2 and below',
                    3:'Level 3 and below',
                    4:'Level 4 and below',
                    5:'Level 5 and below',
                    6:'Level 6',
                })
                .setValue(String(this.plugin.settings.addHeadingIndexFrom))
                .onChange(async (value) => {
                    this.plugin.settings.addHeadingIndexFrom = Number(value) as 7 | HeadingDepth
                    await this.plugin.saveSettings();
                })
            )
    }
}