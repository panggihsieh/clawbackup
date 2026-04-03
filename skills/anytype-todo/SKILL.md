# anytype-todo-skill

記錄待辦事項到 Anytype 的「待辦事項」Space → 「其他」Collection

## Trigger

當用戶說要記錄待辦事項、建立待辦、加入待辦事項、記錄事項、add todo、記錄到 Anytype 等口語指令時使用。

## Usage

1. 從用戶對話中擷取待辦事項內容
2. 使用 MCP server 在「待辦事項」Space 的「其他」Collection 中建立新頁面

## Space 資訊

- **Space 名稱**: 待辦事項
- **Space ID**: `bafyreiccohqqjybbyltdr74hfb7652twx7hbdtfqgwejjmjz6nhifd5yh4.f2a592vf4sv7`
- **Collection 名稱**: 其他
- **Collection ID**: `bafyreihept7exmxamkylw2cu6oskt2owlvroxbrtfl3and4ecu4d2xtt4u`

## Action

使用 mcporter 呼叫 anytype.API-create-object 建立新頁面，然後用 API-add-list-objects 加入 Collection：

```bash
# 1. 建立 Task（會回傳 object_id）
mcporter call 'anytype.API-create-object(space_id: "bafyreiccohqqjybbyltdr74hfb7652twx7hbdtfqgwejjmjz6nhifd5yh4.f2a592vf4sv7", name: "[事項標題]", type_key: "task")'

# 2. 加入 Collection（把 [object_id] 換成上一步回傳的 ID）
mcporter call 'anytype.API-add-list-objects(space_id: "bafyreiccohqqjybbyltdr74hfb7652twx7hbdtfqgwejjmjz6nhifd5yh4.f2a592vf4sv7", list_id: "bafyreihept7exmxamkylw2cu6oskt2owlvroxbrtfl3and4ecu4d2xtt4u", objects: ["[object_id]"])'
```

## Response

告訴用戶已成功記錄到 Anytype 的「其他」Collection！