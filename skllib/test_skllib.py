import unittest
from concurrent.futures.thread import ThreadPoolExecutor

import pytest
from ucimlrepo import fetch_ucirepo

from pythonApp.lib.queue_controller.helpers import  start_pipeline, stop_pipeline, gather_results
from pythonApp.lib.queue_controller.queueData import QueueData
from pythonApp.lib.skllib.clean import new_clean_pl
from pythonApp.lib.skllib.explore import new_explore_pl
from pythonApp.lib.skllib.mongo import MongoPipelineStorage
from pythonApp.lib.skllib.split import new_save_metadata_node

class MyTestCase(unittest.TestCase):
    storage = None

    def setUp(self):
        self.storage = MongoPipelineStorage('mongodb://localhost:27017')

    def test_clean_pl(self):
        with ThreadPoolExecutor() as executor:
            try:
                df = self.storage.load_dataset("235")
                print("loaded dataset 235")
            except RuntimeError:
                df = fetch_ucirepo(id=235).data.features
                self.storage.save_dataset(df, "235")
                print("fetched dataset 235")

            storage = MongoPipelineStorage('mongodb://localhost:27017')
            pl = new_clean_pl(storage, "235")
            try:
                worker_tasks = start_pipeline(executor=executor, nodes=pl)
                pl[0].enqueue(df)
            except ExceptionGroup as eg:
                pytest.fail(f"Pipeline node failed: {eg}")
            finally:
                stop_pipeline(nodes=pl)
                gather_results(worker_tasks)

    def test_something_else2(self):
        with ThreadPoolExecutor() as executor:
            storage = MongoPipelineStorage('mongodb://localhost:27017')

            model_names = ["235_hist_gradient_model_11", "235_hist_gradient_model_9"]
            data = fetch_ucirepo(id=235).data.features
            histpl = new_save_metadata_node(storage)
            try:
                worker_tasks = start_pipeline(executor=executor, nodes=histpl)
                chunk_size = 1000
                for i in range(0, len(data), chunk_size):
                    qd = QueueData()
                    qd.set_attribute("data", data.iloc[i: i + chunk_size].copy())
                    histpl[0].enqueue(qd)
            except ExceptionGroup as eg:
                pytest.fail(f"Pipeline node failed: {eg}")
            finally:
                stop_pipeline(nodes=histpl)
                gather_results(worker_tasks)


    def test_something_fun(self):
        with ThreadPoolExecutor() as executor:
            storage = MongoPipelineStorage('mongodb://localhost:27017')
            try:
                df = storage.load_dataset("235")
                print("loaded dataset 235")
            except RuntimeError:
                df = fetch_ucirepo(id=235).data.features
                storage.save_dataset(df, "235")
                print("fetched dataset 235")

            histpl = new_explore_pl(storage, "235")
            try:
                worker_tasks = start_pipeline(executor=executor, nodes=histpl)
                qd = QueueData()
                qd.set_attribute("data", df)
                histpl[0].enqueue(qd)
            except ExceptionGroup as eg:
                pytest.fail(f"Pipeline node failed: {eg}")
            finally:
                stop_pipeline(nodes=histpl)
                gather_results(worker_tasks)


    def test_pull_file(self):
        from ucimlrepo import fetch_ucirepo

        # 1. Fetch the dataset (id 235 = Wine Quality)
        dataset = fetch_ucirepo(id=235)

        # 2. Combine features and targets into a single DataFrame
        # .original contains all columns (ids, features, and targets)
        df = dataset.data.original
        df = df[:50000]

        # 3. Save to local directory
        df.to_csv('wine_quality.csv', index=False)

        print("File saved successfully as 'wine_quality.csv'")
    def test_transferimages(self):
        storage = MongoPipelineStorage('mongodb://localhost:27017')
        storage.transfer_to_drive(target_directory="D:\\dataset_images")

if __name__ == '__main__':
    unittest.main()
