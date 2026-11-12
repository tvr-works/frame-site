@testable import FrameEngine
@testable import FrameMacOS
@testable import FrameUI
import FrameTestSupport
import Common
import Foundation
import XCTest

@MainActor final class BrowserDemoTraceTest: XCTestCase {
    func testBrowserDemoTrace() async throws {
        setUpWorkspacesForTests()
        let ws = Workspace.get(byName: "1")
        _ = ws.focusWorkspace()
        var traces: [[String: Any]] = []
        func capture(_ label: String) {
            traces.append([
                "label": label,
                "workspace": focus.workspace.name,
                "focused": focus.windowOrNil.map { Int($0.windowId.serial) } as Any? ?? NSNull(),
                "columns": ["1", "2"].map { name in
                    Workspace.get(byName: name).columns.map { column in
                        column.children.compactMap { ($0 as? Window).map { Int($0.windowId.serial) } }
                    }
                },
            ])
        }
        func create(_ id: UInt32) {
            let binding = focus.workspace.newTilingWindowBindingData()
            _ = TestWindow.new(id: id, parent: binding.parent).focusWindow()
        }
        capture("empty")
        create(1); capture("create")
        create(2); capture("create")
        _ = try await FocusCommand(args: FocusCmdArgs(rawArgs: [], direction: .left)).run(.defaultEnv, .emptyStdin)
        capture("focus-left")
        create(3); capture("create")
        _ = try await MoveCommand(args: MoveCmdArgs(rawArgs: [], .right)).run(.defaultEnv, .emptyStdin)
        capture("move-right")
        _ = try await MoveCommand(args: MoveCmdArgs(rawArgs: [], .up)).run(.defaultEnv, .emptyStdin)
        capture("move-up")
        _ = try await MoveNodeToWorkspaceCommand(args: MoveNodeToWorkspaceCmdArgs(workspace: "2")).run(.defaultEnv, .emptyStdin)
        capture("send-2")
        _ = Workspace.get(byName: "2").focusWorkspace()
        capture("workspace-2")
        create(4); capture("create")
        let data = try JSONSerialization.data(withJSONObject: traces, options: [.sortedKeys])
        print("BROWSER_DEMO_TRACE=" + String(decoding: data, as: UTF8.self))
    }
}
