//添加交互接口，调用core
import { Plugin, MarkdownView,Notice,App,PluginSettingTab,Setting} from "obsidian";
//import { MarkdownIndex } from "./indexFormatter_old";
import {MySetting ,format_index_for_a_note} from "./core";

const MY_DEFAULT_SETTING: MySetting = {
    testSetting1: 'test default setting',
    listIndex:'Increase from 1.',
    titleIndex:1
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

        this.registerEvent(
            this.app.workspace.on("editor-menu", (menu, editor, view) => {
                console.log("在编辑器点击右键菜单")
                const cursor = editor.getCursor();
                if(/^#+ .*/.test(editor.getLine(cursor.line))){
                    menu.addItem((item) => {
                        item
                            .setTitle("Print file path 👈")
                            .setIcon("document")
                            .onClick(async () => {
                                new Notice("AAAAAAAAA");
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
                    'Disabled':'Disabled',
                    'Increase from 1.':'Increase from 1.',
                    'Increase from any':'Increase from any',
                    'Always 1.':'Always 1.',
                })
                .setValue(this.plugin.settings.listIndex)
                .onChange(async (value) => {
                    this.plugin.settings.listIndex = value;                    
                    await this.plugin.saveSettings();
                })
            )
                    
        new Setting(containerEl)
            .setName('Add index to titles ')
            .addDropdown(Dropdown => Dropdown
                .addOptions({
                    6:'Disabled',
                    0:'All Levels',
                    1:'Level 2 and below',
                    2:'Level 3 and below',
                    3:'Level 4 and below',
                    4:'Level 5 and below',
                    5:'Level 6',
                })
                .setValue(String(this.plugin.settings.titleIndex))
                .onChange(async (value) => {
                    this.plugin.settings.titleIndex = Number(value)
                    await this.plugin.saveSettings();
                })
            )
    }
}