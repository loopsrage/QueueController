import pandas as pd

from pythonApp.lib.queue_controller.helpers import new_controller, link_pipeline
from pythonApp.lib.queue_controller.queueData import QueueData
from pythonApp.lib.skllib.mongo import MongoPipelineStorage

def convert_numeric(data: pd.DataFrame, target_columns: list = None) -> pd.DataFrame:
    df = data.copy()
    for col in data.columns:
        numeric_series = pd.to_numeric(df[col], errors='coerce')
        if numeric_series.notna().any():
            df[col] = numeric_series.fillna(numeric_series.mean())

    if target_columns:
        df = df.reindex(columns=target_columns, fill_value=0)
    return df

def auto_extract_dates(data):
    date_columns = []
    df = data.copy()
    for col in data.select_dtypes(include="object").columns:
        selcol = df[col]
        hms = pd.to_timedelta(selcol, errors='coerce')
        if hms.notna().any():
            df[f'hour'] = hms.dt.components['hours']
            df[f'minute'] = hms.dt.components['minutes']
            date_columns.append(col)

        dt_series = pd.to_datetime(selcol, errors='coerce')
        if dt_series.notna().any():
            df[f'year'] = dt_series.dt.year
            df[f'month'] = dt_series.dt.month
            df[f'day'] = dt_series.dt.day
            df[f'day_of_week'] = dt_series.dt.dayofweek
            date_columns.append(col)

    df = df.drop(columns=date_columns, errors='ignore')
    return df

def convert(queue_data: QueueData):
    df = queue_data.attribute("data")
    queue_data.set_attribute("data", convert_numeric(df))

def extract_dates(queue_data: QueueData):
    df = queue_data.attribute("data")
    queue_data.set_attribute("data", auto_extract_dates(df))

def new_clean_pl(storage: MongoPipelineStorage, dataset_name):

    def save_node(queue_data: QueueData):
        data = queue_data.attribute("data")
        storage.save_clean_files(dataset_name, data)

    pl = [new_controller(action=convert), new_controller(action=extract_dates), new_controller(action=save_node)]
    link_pipeline(pl)
    return pl