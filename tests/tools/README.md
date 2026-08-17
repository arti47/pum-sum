# Extraction tools (retained for re-verification)

These are the scripts that produced the data files. They are kept so any value in
`data-*.js` can be re-checked against the PDFs rather than trusted.

## `pdf-reconstruct.py`

The authoritative text pass.

```sh
pdftotext -bbox SUM.pdf sum.xml
python3 pdf-reconstruct.py sum.xml sum.txt 7
```

Clusters word-level bounding boxes into rows by `yMax` (tolerance in points, 7 works for
both books) and orders each row by `xMin`, printing the x-offset of each column break.

**Why this rather than plain extraction:** plain `pdftotext` emits a two-column SUM table's
*right* column before its *left*. Every "low result" list would have been transcribed as its
opposite, inverting the Rule of Bias across all twenty-four SUM tables. This pass pairs the
halves row by row, so the ordering is recovered rather than guessed.

## `count-track-boxes.py`

The plot-track box counts are vector geometry, not text.

```sh
pdftoppm -f 14 -l 14 -r 300 -x 140 -y 1190 -W 1520 -H 120 -png PUM.pdf strip
python3 count-track-boxes.py strip-14.png 0.85
```

Renders a strip of the track at 300 dpi and finds dark columns by pixel analysis, reporting
**full-height** dividers (section rules) separately from **half-height** ones (box dividers).
Every `boxes` count in `data-pum-plot.js` is a measured divider count from this script, not
an estimate: Standard 3/5/3, Journey 3/7/4/3/3, Exploration 1/3/3/3/1, and so on.
