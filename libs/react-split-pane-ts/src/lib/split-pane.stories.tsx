import { SplitPane } from './split-pane';
export default {
  title: 'components/split-pane',
  component: SplitPane,
};

export const Normal = () => {
  return (
    <SplitPane onDragFinished={(sizes => console.log('sizes: ', sizes))}>
      <div>Div1</div>
      <div>Div2</div>
      <div>Div3</div>
    </SplitPane>
  );
};

export const vertical = () => {
    return (
      <SplitPane split='horizontal' onDragFinished={(sizes => console.log('sizes: ', sizes))}>
        <div>Div1</div>
        <div>Div2</div>
        <div>Div3</div>
      </SplitPane>
    );
  };
