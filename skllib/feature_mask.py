def feature_mask(data, cvi=None, skew=None, riqr=None):
    if cvi is None:
        cvi = .3

    if skew is None:
        skew = 1.

    if riqr is None:
        riqr = .5

    numeric_df = data.select_dtypes(include='number')
    cv = numeric_df.std() / numeric_df.mean().abs()
    skewness = numeric_df.skew()
    iqr = numeric_df.quantile(0.75) - numeric_df.quantile(0.25)
    relative_iqr = iqr / numeric_df.median().abs()
    wm = (cv > cvi) & (skewness.abs() > skew) & (relative_iqr > riqr)
    return wm[wm].index.tolist()