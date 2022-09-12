

# React split pane ts

Inspired by react-split-pane. 
Tried to keep as simple as possible

```html 
    <SplitPane style={{width: '300px', border: '1px solid red'}} onDragFinished={(sizes => console.log('sizes: ', sizes))}>
      <div>Div1</div>
      <div>Div2</div>
      <div>Div3</div>
    </SplitPane>
```