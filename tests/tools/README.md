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

## `gum-parse.py`

GUM's 43 tables are two-per-row in narrow columns. A long left-hand entry can end within 12pt
of the right-hand entry's number, so a naive gap-based split merges the two and silently loses
rows. This script:

1. rebuilds rows from word boxes as above, but **forces a column break before any list number
   more than 150pt from its run's start**;
2. clusters entries into columns by x, splits each column wherever the numbering restarts, and
   names each table from the nearest heading above it;
3. merges the two halves of a d100 table (1-50 and 51-100 on the same page);
4. **validates that every table's numbering is contiguous 1..N** and that N is 20 or 100 before
   anything is transcribed.

It reported 43 tables, 1,580 rows, 0 malformed. That validation is what makes parsing safer
than hand-transcription at this volume — a dropped row cannot pass it silently.

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
