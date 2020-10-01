import React from "react";

import {
  XYPlot,
  XAxis,
  YAxis,
  VerticalRectSeries,
  LineSeries,
  Highlight,
  FlexibleXYPlot,
  BarSeries
} from "react-vis";

const DATA = [
  { x0: new Date("01/01/2018"), x: new Date("01/01/2018"), y: 1 },
  { x0: new Date("01/02/2018"), x: new Date("01/02/2018"), y: 2 },
  { x0: new Date("01/03/2018"), x: new Date("01/03/2018"), y: 10 },
  { x0: new Date("01/04/2018"), x: new Date("01/04/2018"), y: 6 },
  { x0: new Date("01/05/2018"), x: new Date("01/05/2018"), y: 5 },
  { x0: new Date("01/06/2018"), x: new Date("01/06/2018"), y: 3 },
  { x0: new Date("01/07/2018"), x: new Date("01/07/2018"), y: 1 }
];

class DragableChartExample extends React.Component {
  state = {
    selectionStart: null,
    selectionEnd: null
  };

  render() {
    const { selectionStart, selectionEnd } = this.state;
    const updateDragState = (area) =>
      this.setState({
        selectionStart: area && area.left,
        selectionEnd: area && area.right
      });

    return (
      <div>
        <FlexibleXYPlot height={200} xType="time">
          <XAxis />
          <YAxis />

          <VerticalRectSeries
            data={[
              { x: new Date("01/01/2018"), y: 75 },
              { x: new Date("01/14/2018"), y: 10 },
              { x: new Date("01/18/2018"), y: 80 },
              { x: new Date("01/19/2018"), y: 90 }
            ]}
          />

          <Highlight
            color="#829AE3"
            drag
            enableY={false}
            onDrag={updateDragState}
            onDragEnd={updateDragState}
          />
        </FlexibleXYPlot>

        <div></div>
      </div>
    );
  }
}

export default DragableChartExample;
