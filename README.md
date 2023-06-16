# Hierarchify

Hierarchify is an Obsidian plugin designed to streamline and enhance the management of hierarchical relationships in your notes. It provides a set of useful features that facilitate efficient knowledge organization.

## Motivation

Imagine you have a set of knowledge with hierarchical relationships, such as three types of fruits: apple, banana, and watermelon. You need to decide how to structure them: Option 1: Each fruit is a separate note within a folder.

```
├─ Fruits
│  ├─ Apple.md
│  ├─ Banana.md
│  └─ Watermelon.md
```

Option 2: Each fruit is a second-level heading within a single note.

```markdown
# Fruits 
## Apple 
...
## Banana 
...
## Watermelon
...

```
Option 3: Each fruit is a list item within a single note.

```markdown
## Fruits 
1. Apple 
2. Banana 
3. Watermelon
```

Initially, you might choose Option 3, as it seems reasonable for managing a small set of content. However, as your content grows and you need to add more information, you face the challenge of dealing with nested lists or manually refactoring the structure into Option 2 or Option 1. If you later decide to use Zettelkasten and manage notes with links, you would need to manually add links to each parent note. This refactoring process can be time-consuming.

An ideal solution would be to start with a Zettelkasten approach, taking atomic notes from the beginning. However, the file tree has its advantages, providing a more intuitive and conducive environment for longer notes.

Therefore, Hierarchify offers the following features to save you time on decision-making and note restructuring, allowing you to combine the benefits of both Zettelkasten and the file tree.

## Features

1.  Title-List Conversion:
    -   Convert titles to lists.
    -   Transform titles to different levels of hierarchy.
    -   Convert lists back to titles.
    -   Preserve the structure of selected titles or lists through recursive processing.
    -   Choose to apply the changes to a specific title or all parallel titles.
2.  TODO: Content Extraction:
    -   Cut and extract the content of a title or a list, facilitating easy copying to another location.
3.  Title-File Conversion:
    -   Extract a title and its content into a separate file, using the title as the file name.
    -   Split notes into multiple notes based on titles, using the original note name as the folder name.
    -   TODO: Merge all notes within a folder into a single note.
    -   Adjust the title hierarchy appropriately when merging or splitting notes.
4.  File Tree Linking:
    -   Create a note with the same name as a folder and add links to other notes within that folder.
    -   Recursively process all subfolders within the folder.
    -   This feature allows you to disperse notes across different folders while preserving the hierarchical relationships, effectively combining Zettelkasten and the file tree.
    -   Recommended for use in conjunction with the Folder Note plugin.
5.  Numbered Headings:
    -   Add sequential numbers to your headings, facilitating the conversion between ordered lists and titles.
6.  TODO: Merge all notes linked to a specific note (or folder) into that note.

All of the above features are implemented based on mdast, converting Markdown to an Abstract Syntax Tree (AST), making necessary modifications, and converting it back to Markdown. This process essentially performs formatting operations.

## Issues

### Different mdast Processing in Obsidian

Certain behaviors of mdast differ from the default behavior of the Obsidian editor and my personal preferences, resulting in some inconsistencies.

1.  Two spaces are added between the number and text in ordered list items.
2.  Escape characters are added to all square brackets (which breaks wiki links).
3.  TODO: Nested lists are not recognized as lists unless they start with 1.
4.  TODO: Code blocks are not recognized as such if the language is not specified.

To address the first two issues, I have made some modifications to the code and adjusted Obsidian settings accordingly:

1.  Use space indentation.
2.  Set the tab width to 4.

However, extensive testing is still required, as there may be other issues. Currently, all refactoring features do not delete any note content.

## Missing Configuration Options

I plan to add more configuration options to define the plugin's behavior:

1.  When converting titles to lists, choose whether to always create a new list (current behavior) or merge with an existing list.
2.  Specify the location for generated files and folders when converting titles to notes, file tree linking, etc.

## Future Enhancements

Please refer to the TODO sections in the feature descriptions for upcoming improvements and features.