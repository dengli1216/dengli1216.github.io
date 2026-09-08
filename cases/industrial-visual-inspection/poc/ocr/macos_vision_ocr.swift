import AppKit
import Foundation
import Vision

struct Candidate: Encodable {
    let text: String
    let confidence: Float
}

guard CommandLine.arguments.count == 2 else {
    fputs("usage: macos_vision_ocr.swift <image-path>\n", stderr)
    exit(2)
}

let imageURL = URL(fileURLWithPath: CommandLine.arguments[1])
guard let image = NSImage(contentsOf: imageURL),
      let cgImage = image.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
    fputs("unable to read image\n", stderr)
    exit(2)
}

let request = VNRecognizeTextRequest()
request.recognitionLevel = .accurate
request.usesLanguageCorrection = false
request.recognitionLanguages = ["en-US"]
let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])

do {
    try handler.perform([request])
    let candidates = (request.results ?? []).compactMap { observation -> Candidate? in
        guard let top = observation.topCandidates(1).first else { return nil }
        return Candidate(text: top.string, confidence: top.confidence)
    }
    let data = try JSONEncoder().encode(candidates)
    print(String(decoding: data, as: UTF8.self))
} catch {
    fputs("ocr failed: \(error)\n", stderr)
    exit(1)
}
