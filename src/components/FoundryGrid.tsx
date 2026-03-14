"use client"
import dynamic from 'next/dynamic';

// 1. Cast the dynamic imports as 'any' to bypass strict prop-checking during build
const Grid = dynamic(
  () => import('react-window').then((mod: any) => mod.FixedSizeGrid), 
  { ssr: false }
) as any;

const AutoSizer = dynamic(
  () => import('react-virtualized-auto-sizer').then((mod: any) => {
    return mod.default || mod.AutoSizer;
  }),
  { ssr: false }
) as any;

const Cell = ({ columnIndex, rowIndex, style }: any) => (
  <div 
    style={style} 
    className="border-[0.5px] border-gray-800/20 hover:bg-blue-600/30 transition-colors cursor-crosshair"
  />
);

export default function FoundryGrid() {
  return (
    <div className="fixed inset-0 -z-10 opacity-30">
      <AutoSizer>
        {({ height, width }: any) => (
          <Grid
            columnCount={1000}
            columnWidth={40}
            height={height}
            rowCount={1000}
            rowHeight={40}
            width={width}
          >
            {Cell}
          </Grid>
        )}
      </AutoSizer>
    </div>
  );
}