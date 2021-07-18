import UIKit

class ViewController: UIViewController {
    @IBAction func valueChanged(_ sender: UISlider) {
        let format = NSLocalizedString("years_on_hills", comment: "a pluralization example")
        print(format)
        print(String.init(format: format, 0, 5))
        print(String.init(format: format, 1, 4))
        print(String.init(format: format, 2, 1))
        print(String.init(format: format, 3, 2))
        print(String.init(format: format, 4, 3))
        print(String.init(format: format, 5, 0))
    }
}
