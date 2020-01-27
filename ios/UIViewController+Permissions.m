//
//  UIViewController+Presentation.m
//  RNGruveo
//
//  Created by Xavier Ramos Oliver on 27/01/2020.
//  Copyright © 2020 Marc Shilling. All rights reserved.
//

// This Category fixes the ModalPresentation style to UIModalPresentationFullScreen (which was the default one until iOS 13)
// It is required for Gruveo because the new default style allows users to dismiss the Call ViewController without our app's concern.
// + info: https://stackoverflow.com/a/59162371


#import <UIKit/UIKit.h>
#import "UIViewController+Presentation.h"
#import "objc/runtime.h"

@implementation UIViewController (Presentation)

- (void)setModalPresentationStyle:(UIModalPresentationStyle)modalPresentationStyle {
    [self setPrivateModalPresentationStyle:modalPresentationStyle];
}

- (UIModalPresentationStyle) modalPresentationStyle {
    UIModalPresentationStyle style = [self privateModalPresentationStyle];
    if (style == NSNotFound) {
        return UIModalPresentationFullScreen;
    }
    return style;
}

- (void) setPrivateModalPresentationStyle:(UIModalPresentationStyle)modalPresentationStyle {
    NSNumber *styleNumber = [NSNumber numberWithInteger:modalPresentationStyle];
     objc_setAssociatedObject(self, @selector(privateModalPresentationStyle), styleNumber, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

- (UIModalPresentationStyle)privateModalPresentationStyle {
    NSNumber *styleNumber = objc_getAssociatedObject(self, @selector(privateModalPresentationStyle));
    if (styleNumber == nil) {
        return NSNotFound;
    }
    return styleNumber.integerValue;
}

@end
