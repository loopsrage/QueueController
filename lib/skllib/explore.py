import pandas as pd
from matplotlib.backends.backend_template import FigureCanvas
from matplotlib.figure import Figure
from pandas import DataFrame
from sklearn.feature_selection import SelectFromModel

from lib.queue_controller.helpers import new_controller, link_pipeline
from lib.queue_controller.queueController import QueueController
from lib.queue_controller.queueData import QueueData
from lib.skllib.feature_mask import feature_mask
from lib.skllib.mongo import MongoPipelineStorage
from lib.skllib.split import HistGradientEstimator, \
    load_and_predict_model
import seaborn as sns

def cleaned_data_node(storage: MongoPipelineStorage, file_regex: str, send_to: QueueController):

    def clean_enqueue_node(queue_data: QueueData):
        for clean_file in storage.load_clean_files(file_regex):
            nqd = queue_data.copy_derivative(file_regex)
            nqd.set_attribute("data", pd.read_csv(clean_file, compression='gzip'))
            send_to.enqueue(nqd)

    return new_controller(action=clean_enqueue_node)

def feature_find_node(queue_data: QueueData):
    df = queue_data.attribute("data")
    queue_data.set_attribute("feature_mask", feature_mask(df))

def targets_node(queue_data: QueueData):
    df = queue_data.attribute("data")
    mask = queue_data.attribute("feature_mask")
    queue_data.set_attribute("targets", df[mask])

def features_node(queue_data: QueueData):
    df = queue_data.attribute("data")
    mask = queue_data.attribute("feature_mask")
    dataset_name = queue_data.attribute("dataset_name")
    features = df.drop(columns=mask)
    queue_data.set_attribute("model_name", f"{dataset_name}_hist_gradient_model_{features.shape[1]}")
    queue_data.set_attribute("features", df.drop(columns=mask))

def estimator_node(queue_data: QueueData):
    mask = queue_data.attribute("feature_mask")
    targets = queue_data.attribute("targets")
    queue_data.set_attribute("estimator", HistGradientEstimator(mask, targets))

def load_and_predict_storage(storage):

    def load_and_predict_node(queue_data: QueueData):
        df = queue_data.attribute("data")
        features = queue_data.attribute("features")
        estimator = queue_data.attribute("estimator")
        model_name = queue_data.attribute("model_name")
        numeric_cols = features.select_dtypes(include=['number']).columns.tolist()
        categorical_cols = features.select_dtypes(include=['object', 'category']).columns.tolist()
        model, prediction, metadata = load_and_predict_model(
            storage=storage,
            model_name=model_name,
            data=df,
            selector=SelectFromModel(estimator.selector_model),
            estimator=estimator.estimator,
            numeric_cols=numeric_cols,
            categorical_cols=categorical_cols)
        queue_data.set_attribute("model", model)
        queue_data.set_attribute("prediction", prediction)
        queue_data.set_attribute("metadata", metadata)

    def fit_node(queue_data: QueueData):
        model = queue_data.attribute("model")
        features = queue_data.attribute("features")
        targets = queue_data.attribute("targets")
        model.fit(features, targets)

    pl = [new_controller(action=load_and_predict_node), new_controller(action=fit_node)]
    link_pipeline(pl)
    return pl

def new_explore_pl(storage: MongoPipelineStorage, dataset_name, clean_file_pattern = None):

    def explore(queue_data: QueueData):
        model = queue_data.attribute("model")
        model_name = queue_data.attribute("model_name")
        mask = queue_data.attribute("feature_mask")
        estimator = queue_data.attribute("estimator")
        storage.save_model(model, model_name, {
            "target_mask": list(mask),
            "type": estimator.estimator_type
        })

    def single_feature_pair_plot(queue_data: QueueData):
        model_name: str = queue_data.attribute_from_derivative("model_name", "")
        df: DataFrame = queue_data.attribute_from_derivative("data", "")
        feature: str = queue_data.attribute("feature")
        target: str = queue_data.attribute("target")
        fig = Figure(figsize=(24, 6))
        # Create the figure object directly (Thread-safe)
        try:
            canvas = FigureCanvas(fig)
            ax = fig.add_subplot(111)

            png_name = f"{dataset_name}_%s_vs_%t.png".replace("%s", feature).replace("%t", target)
            sns.scatterplot(data=df, x=feature, y=target, alpha=.3, ax=ax)
            sns.regplot(data=df, x=feature, y=target, scatter=False, color='red', ax=ax)

            storage.save_image(file_name=png_name, model_name=model_name, figure=fig)
        except Exception:
            raise
        finally:
            # In the OO API, there is no plt.close().
            # Just clear the figure to ensure internal refs are dropped immediately.
            fig.clear()
            del fig, ax

    ffe = new_controller(action=single_feature_pair_plot)
    def split_node(queue_data: QueueData):
        features, targets = queue_data.attribute("features"), queue_data.attribute("targets")
        for ti in targets:
            for fi in features:
                nqd = queue_data.copy_derivative(ti)
                nqd.set_attribute("feature", fi)
                nqd.set_attribute("target", ti)
                ffe.enqueue(nqd)

    lap = load_and_predict_storage(storage)
    pl = [
        new_controller(action=feature_find_node),
        new_controller(action=targets_node),
        new_controller(action=features_node),
        new_controller(action=estimator_node),
        new_controller(action=features_node),
        *lap,
        new_controller(action=explore),
        new_controller(action=split_node)]
    link_pipeline(pl)
    pl.append(ffe)
    pl.append(cleaned_data_node(storage, clean_file_pattern, pl[0]))
    return pl